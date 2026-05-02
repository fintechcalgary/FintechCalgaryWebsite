import { connectToDatabase } from "@/lib/mongodb";
import { createArticles, getArticleByUrl, getArticles, updateArticleSummary } from "@/lib/models/article";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { logError, logInfo, logWarn } from "@/lib/serverLogger";
import { queueRefreshRequest } from "@/lib/requestQueue";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dynamic = "force-dynamic";

/**
 * POST: Fetch new articles from RSS, import to DB, optionally generate summaries, update refresh timestamp.
 * GET: Return last refresh time for the insights page.
 */
export async function POST(req) {
  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    let allowPublicFetch = false;
    try {
      const db = await connectToDatabase();
      const articleCount = await db.collection("articles").countDocuments();
      allowPublicFetch = articleCount < 5;
    } catch (e) {
      allowPublicFetch = false;
    }

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        const { getServerSession } = await import("next-auth/next");
        const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "admin" && !allowPublicFetch)) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    } else if (!allowPublicFetch) {
      const { getServerSession } = await import("next-auth/next");
      const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const result = await queueRefreshRequest(async () => {
      const db = await connectToDatabase();
      logInfo("Starting article refresh...");

      const backendDir = path.join(process.cwd(), "backend");
      const scriptPath = path.join(backendDir, "fetch_finance_news.py");

      let fetchResult = { imported: 0, skipped: 0, total: 0 };

      try {
        if (!fs.existsSync(scriptPath)) {
          logWarn("Fetch script not found; skipping fetch step", { scriptPath });
        } else {
          logInfo("Fetching articles from RSS...");
          const { stdout, stderr } = await execAsync(
            `python3 "${scriptPath}"`,
            { cwd: backendDir }
          );
          if (stderr) logWarn("Python script warnings", { stderr });
        }

        const dataDir = path.join(backendDir, "data");
        if (fs.existsSync(dataDir)) {
          const files = fs.readdirSync(dataDir)
            .filter(f => f.startsWith("finance_news_") && f.endsWith(".json"))
            .sort()
            .reverse();

          const recentFiles = files.slice(0, 7);
          let totalImported = 0;
          let totalSkipped = 0;

          for (const file of recentFiles) {
            const filePath = path.join(dataDir, file);
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const articlesFromFile = JSON.parse(fileContent);

            for (const article of articlesFromFile) {
              const existing = await getArticleByUrl(db, article.url);
              if (!existing) {
                await createArticles(db, [article]);
                totalImported++;
              } else {
                totalSkipped++;
              }
            }
          }

          fetchResult = {
            imported: totalImported,
            skipped: totalSkipped,
            total: totalImported + totalSkipped,
          };
        }
      } catch (error) {
        logError("Error fetching articles", error);
        throw new Error(`Failed to fetch articles: ${error.message}`);
      }

      let summariesGenerated = 0;
      const geminiApiKey = process.env.GEMINI_API;
      if (geminiApiKey && geminiApiKey !== "your_gemini_api_key_here" && fs.existsSync(backendDir)) {
        try {
          const articlesWithoutSummaries = await getArticles(db, {
            hasSummary: false,
            limit: 30,
          });

          if (articlesWithoutSummaries.length > 0) {
            const pythonCmd = process.platform === "win32" ? "python" : "python3";
            const scriptFile = path.join(backendDir, "temp_auto_summaries.py");

            const pythonScript = `
import sys
import json
import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

env_paths = [Path('.env.local'), Path('..') / '.env.local', Path('../..') / '.env.local']
api_key = os.environ.get('GEMINI_API')
if not api_key:
    for p in env_paths:
        if p.exists():
            load_dotenv(p)
            api_key = os.getenv("GEMINI_API")
            if api_key: break
if not api_key:
    print("ERROR: GEMINI_API not set", file=sys.stderr)
    sys.exit(1)
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')
articles = json.loads(sys.stdin.read())
results = []
for article in articles:
    title = article.get("title", "")
    source = article.get("source", "Unknown")
    date = article.get("date", "")
    url = article.get("url", "")
    try:
        prompt = f"""You are a financial news analyst. Generate a concise 2-3 sentence summary.
Title: {title}
Source: {source}
Date: {date}
Summary:"""
        response = model.generate_content(prompt)
        summary = response.text.strip().replace('**', '').replace('*', '').strip()
        if summary.startswith("Summary:"): summary = summary.replace("Summary:", "").strip()
        if len(summary) < 20: summary = None
        elif len(summary) > 500: summary = summary[:500] + "..."
        results.append({"url": url, "summary": summary})
    except Exception as e:
        results.append({"url": url, "summary": None})
print(json.dumps(results))
`;
            fs.writeFileSync(scriptFile, pythonScript, "utf-8");
            try {
              const articlesJson = JSON.stringify(articlesWithoutSummaries).replace(/'/g, "'\\''");
              const { stdout, stderr } = await execAsync(
                `echo '${articlesJson}' | ${pythonCmd} "${scriptFile}"`,
                {
                  cwd: backendDir,
                  shell: true,
                  maxBuffer: 10 * 1024 * 1024,
                  env: { ...process.env, GEMINI_API: geminiApiKey },
                }
              );
              if (stderr && !stderr.includes("INFO")) console.error("Summary script stderr:", stderr);
              const results = JSON.parse(stdout);
              for (const r of results) {
                if (r.summary) {
                  for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                      await updateArticleSummary(db, r.url, r.summary);
                      summariesGenerated++;
                      break;
                    } catch (e) {
                      if (attempt === 3) logError("Failed to update summary after retries", e, { url: r.url });
                    }
                  }
                }
              }
            } finally {
              if (fs.existsSync(scriptFile)) fs.unlinkSync(scriptFile);
            }
          }
        } catch (err) {
          console.error("Auto-summary generation error:", err);
        }
      }

      const refreshTimestamp = new Date();
      try {
        await db.collection("refresh_logs").insertOne({
          timestamp: refreshTimestamp,
          articlesImported: fetchResult.imported,
          articlesSkipped: fetchResult.skipped,
          summariesGenerated,
          duration: Date.now() - startTime,
        });
      } catch (e) {
        logError("Error logging refresh", e);
      }

      logInfo("Refresh completed", {
        duration: Date.now() - startTime,
        imported: fetchResult.imported,
        skipped: fetchResult.skipped,
        summariesGenerated,
      });

      return {
        success: true,
        message: "Refresh completed",
        data: {
          articlesImported: fetchResult.imported,
          articlesSkipped: fetchResult.skipped,
          summariesGenerated,
          refreshTimestamp: refreshTimestamp.toISOString(),
          duration: Date.now() - startTime,
        },
      };
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logError("Refresh error", error, { duration: Date.now() - startTime });
    return new Response(
      JSON.stringify({
        success: false,
        error: "Refresh failed. Please try again.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(req) {
  try {
    const db = await connectToDatabase();
    const lastRefresh = await db
      .collection("refresh_logs")
      .findOne({}, { sort: { timestamp: -1 } });

    return new Response(
      JSON.stringify({
        lastRefresh: lastRefresh?.timestamp || null,
        articlesImported: lastRefresh?.articlesImported || 0,
        summariesGenerated: lastRefresh?.summariesGenerated || 0,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching refresh info:", error);
    const isConnectionError = error.message?.includes("MONGODB_URI") ||
                             error.message?.includes("connect") ||
                             error.code === "ECONNREFUSED" ||
                             error.message?.includes("MongoServerSelectionError");
    if (isConnectionError) {
      return new Response(
        JSON.stringify({
          lastRefresh: null,
          articlesImported: 0,
          summariesGenerated: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" } }
      );
    }
    return new Response(
      JSON.stringify({
        lastRefresh: null,
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
