import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import DOMPurify from "isomorphic-dompurify";
import { logError, logInfo } from "@/lib/serverLogger";
import { queueChatRequest } from "@/lib/requestQueue";
import crypto from "crypto";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dynamic = "force-dynamic";

const MAX_HISTORY = 10;
const MAX_ARTICLES = 30;
const MAX_MESSAGE_LENGTH = 2000;

const chatCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function hashMessage(message) {
  return crypto.createHash("sha256").update(message.toLowerCase().trim()).digest("hex");
}

export async function POST(req) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    let { message, conversationHistory = [], articles = [] } = body;

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      message = message.substring(0, MAX_MESSAGE_LENGTH);
    }

    const sanitizedMessage = DOMPurify.sanitize(message, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    }).trim();

    if (!sanitizedMessage) {
      return new Response(
        JSON.stringify({ error: "Invalid message content" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    conversationHistory = conversationHistory.slice(-MAX_HISTORY);

    const cacheKey = `chat:${hashMessage(sanitizedMessage)}`;
    const cached = chatCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      logInfo("Chat response served from cache", { cacheKey });
      return new Response(
        JSON.stringify({ success: true, response: cached.response, cached: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await queueChatRequest(async () => {
      const geminiApiKey = process.env.GEMINI_API;
      if (!geminiApiKey || geminiApiKey === "your_gemini_api_key_here") {
        throw new Error("GEMINI_API environment variable not set");
      }

      const recentArticles = articles
        .filter((article) => {
          if (!article.date && !article.publishedAt) return false;
          const articleDate = new Date(article.date || article.publishedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return articleDate >= weekAgo;
        })
        .slice(0, MAX_ARTICLES)
        .map((article) => ({
          title: article.title,
          source: article.source,
          date: article.date || article.publishedAt,
          summary: article.summary || "",
          url: article.url,
        }));

      const articlesContext = recentArticles
        .map(
          (article, idx) =>
            `${idx + 1}. **${article.title}** (${article.source}, ${article.date})\n   ${article.summary || "No summary available"}`
        )
        .join("\n\n");

      const conversationContext = conversationHistory
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n");

      const isStudentQuery = sanitizedMessage.toLowerCase().includes('student') ||
                            sanitizedMessage.toLowerCase().includes('learn') ||
                            sanitizedMessage.toLowerCase().includes('career') ||
                            sanitizedMessage.toLowerCase().includes('explore') ||
                            sanitizedMessage.toLowerCase().includes('advice') ||
                            sanitizedMessage.toLowerCase().includes('trend') ||
                            sanitizedMessage.toLowerCase().includes('opportunity');

      const systemPrompt = `You are an expert FinTech AI assistant specializing in financial technology news, trends, insights, and career guidance. You excel at helping students, professionals, and enthusiasts understand FinTech developments.

Your capabilities include:
1. **Weekly Summaries**: Comprehensive overviews of the most important FinTech news and events
2. **Trend Analysis**: Identifying emerging trends, technologies, and market shifts
3. **Student Guidance**: Career advice, learning paths, and exploration opportunities in FinTech
4. **Industry Insights**: Deep analysis of developments, partnerships, funding, and innovations
5. **Educational Content**: Explaining complex FinTech concepts in accessible ways

Recent FinTech Articles (last 7 days):
${articlesContext || "No recent articles available."}

${conversationContext ? `\nRecent conversation:\n${conversationContext}\n` : ""}

User's current question: ${sanitizedMessage}

${isStudentQuery ? `\nIMPORTANT: This appears to be a student-focused query. Provide:
- Practical advice and actionable insights
- Learning opportunities and resources
- Career paths and exploration areas
- Trends students should watch
- Skills and knowledge areas to develop
- Real-world examples from recent news` : ''}

Provide a helpful, accurate, and insightful response. If referencing specific articles, mention the source and date. Be engaging, educational, and thorough.

IMPORTANT FORMATTING RULES:
- Do NOT use markdown formatting like **bold** or *italic*
- Do NOT use asterisks or stars for emphasis
- Write in clean, plain text only
- Use clear line breaks to separate sections
- Keep formatting minimal and professional`;

      const backendDir = path.join(process.cwd(), "backend");
      const scriptFile = path.join(backendDir, "temp_chat.py");

      const pythonScript = `
import sys
import json
import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

env_paths = [
    Path('.env.local'),
    Path('..') / '.env.local',
    Path('../..') / '.env.local',
]

api_key = None
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        api_key = os.getenv("GEMINI_API")
        if api_key:
            break

if not api_key:
    api_key = os.environ.get('GEMINI_API')

if not api_key:
    print(json.dumps({"error": "GEMINI_API not found in environment", "error_type": "api_key_missing"}), file=sys.stderr)
    sys.exit(1)

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    prompt = sys.stdin.read()
    if not prompt or not prompt.strip():
        print(json.dumps({"error": "Empty prompt", "error_type": "empty_prompt"}), file=sys.stderr)
        sys.exit(1)
    response = model.generate_content(prompt)
    if response and response.text:
        result = {"success": True, "response": response.text.strip()}
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No response from Gemini API", "error_type": "empty_response"}), file=sys.stderr)
        sys.exit(1)
except Exception as e:
    error_type = type(e).__name__
    error_msg = str(e)
    is_quota_error = "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower()
    result = {"error": error_msg, "error_type": error_type, "is_quota_error": is_quota_error}
    print(json.dumps(result), file=sys.stderr)
    sys.exit(1)
`;

      fs.writeFileSync(scriptFile, pythonScript, "utf-8");

      const pythonCommand = process.platform === "win32" ? "python" : "python3";

      try {
        const { stdout, stderr } = await execAsync(
          `echo ${JSON.stringify(systemPrompt)} | ${pythonCommand} "${scriptFile}"`,
          {
            cwd: backendDir,
            shell: true,
            env: { ...process.env, GEMINI_API: geminiApiKey, PYTHONUNBUFFERED: "1" },
            maxBuffer: 10 * 1024 * 1024,
            timeout: 60000,
          }
        );

        if (fs.existsSync(scriptFile)) {
          fs.unlinkSync(scriptFile);
        }

        if (stderr && !stderr.includes("INFO") && !stderr.includes("Warning")) {
          try {
            const errorResult = JSON.parse(stderr.trim());
            if (errorResult.error) {
              return new Response(
                JSON.stringify({
                  error: errorResult.error,
                  errorType: errorResult.error_type,
                  isQuotaError: errorResult.is_quota_error || false,
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
              );
            }
          } catch (e) {}
        }

        if (!stdout || stdout.trim().length === 0) {
          return new Response(
            JSON.stringify({
              error: "Empty response from AI service",
              details: stderr || "No output received",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        let result;
        try {
          result = JSON.parse(stdout.trim());
        } catch (parseError) {
          return new Response(
            JSON.stringify({
              error: "Invalid response from AI service",
              details: stdout.substring(0, 500),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.success && result.response) {
          return result.response;
        }

        throw new Error("Unexpected response format");
      } catch (execError) {
        if (fs.existsSync(scriptFile)) {
          try { fs.unlinkSync(scriptFile); } catch (e) {}
        }
        const stderr = execError.stderr || "";
        if (stderr) {
          try {
            const errorResult = JSON.parse(stderr.trim());
            if (errorResult.error) {
              return new Response(
                JSON.stringify({
                  error: errorResult.error,
                  errorType: errorResult.error_type,
                  isQuotaError: errorResult.is_quota_error || false,
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
              );
            }
          } catch (e) {}
        }
        throw execError;
      }
    });

    return new Response(
      JSON.stringify({ success: true, response: result }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    if (error.message.includes("GEMINI_API")) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API environment variable not set",
          suggestion: "Please set a valid Gemini API key in .env.local",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    logError("Chat API error", error, { duration: Date.now() - startTime });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
