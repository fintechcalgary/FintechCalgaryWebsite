import DOMPurify from "isomorphic-dompurify";
import { logError, logInfo } from "@/lib/serverLogger";
import { queueChatRequest } from "@/lib/requestQueue";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const MAX_HISTORY = 10;
const MAX_ARTICLES = 30;
const MAX_MESSAGE_LENGTH = 2000;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const chatCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function hashMessage(message) {
  return crypto.createHash("sha256").update(message.toLowerCase().trim()).digest("hex");
}

async function callGroq(apiKey, prompt) {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      }),
      signal: AbortSignal.timeout(30000)
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Groq request failed (${response.status})${errorText ? `: ${errorText.slice(0, 200)}` : ""}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) throw new Error("Empty response from Groq");

  return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
}

export async function POST(req) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    let { message, conversationHistory = [], articles = [] } = body;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({
          error: "GROQ_API_KEY environment variable not set",
          suggestion: "Set GROQ_API_KEY in .env.local and restart the dev server.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

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
      ALLOWED_ATTR: [],
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
      const recentArticles = articles
        .filter((article) => {
          if (!article.date && !article.publishedAt) return true; // include if no date
          const articleDate = new Date(article.date || article.publishedAt);
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          return articleDate >= monthAgo;
        })
        .slice(0, MAX_ARTICLES)
        .map((article) => ({
          title: article.title,
          source: article.source,
          date: article.date || article.publishedAt,
          summary: article.summary || "",
          url: article.url,
        }));

      const articlesContext = recentArticles.length > 0
        ? recentArticles
            .map(
              (a, idx) =>
                `${idx + 1}. ${a.title} (${a.source || "Unknown"}, ${a.date || "recent"})\n   ${a.summary || "No summary available"}`
            )
            .join("\n\n")
        : "No recent articles available.";

      const conversationContext = conversationHistory
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n");

      const isStudentQuery =
        /student|learn|career|explore|advice|trend|opportunity/i.test(sanitizedMessage);

      const prompt = [
        "You are an expert FinTech AI assistant for FinTech Calgary.",
        "You specialize in financial technology news, trends, insights, and career guidance.",
        "",
        "Recent FinTech Articles:",
        articlesContext,
        conversationContext ? `\nRecent conversation:\n${conversationContext}\n` : "",
        `User: ${sanitizedMessage}`,
        "",
        isStudentQuery
          ? "This is a student-focused query. Include practical advice, career paths, learning resources, and trends to watch."
          : "",
        "Provide a helpful, accurate response. Reference specific articles where relevant (mention source and date).",
        "Write in clean plain text. No markdown, no asterisks, no bullet symbols — use line breaks to separate sections.",
      ]
        .filter(Boolean)
        .join("\n");

      const responseText = await callGroq(groqApiKey, prompt);

      chatCache.set(cacheKey, { response: responseText, timestamp: Date.now() });

      return responseText;
    });

    logInfo("Chat response generated", { duration: Date.now() - startTime });

    return new Response(
      JSON.stringify({ success: true, response: result }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logError("Chat API error", error, { duration: Date.now() - startTime });
    return new Response(
      JSON.stringify({
        error: "Failed to get a response. Please try again.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
