import { connectToDatabase } from "@/lib/mongodb";
import { getArticleByUrl, updateArticleSummary } from "@/lib/models/article";
import { fetchGoogleNewsArticles } from "@/lib/googleNewsRss";
import {
  createOrUpdateWeeklyDigest,
  ensureWeeklyDigestIndexes,
  getWeekStart,
  WEEKLY_ARTICLE_TOTAL_LIMIT,
  WEEKLY_DIGEST_ARTICLE_LIMIT,
} from "@/lib/models/weeklyDigest";
import { logError, logInfo, logWarn } from "@/lib/serverLogger";
import { queueRefreshRequest } from "@/lib/requestQueue";
import { callGroq } from "@/lib/groq";

export const dynamic = "force-dynamic";

// ─── Groq summary generation ───────────────────────────────────────────────

async function generateSummaryWithGroq({ apiKey, article }) {
  const prompt = [
    "Write a concise 2-3 sentence summary of this fintech news article for a professional audience.",
    "Focus on the key development, its significance, and potential impact on the industry.",
    "",
    `Title: ${article.title}`,
    `Source: ${article.source || "Unknown"}`,
    "",
    "Respond with only the summary text. No markdown, no asterisks, no bullet points.",
  ].join("\n");

  return callGroq(apiKey, prompt, { maxTokens: 200, timeoutMs: 20000 });
}

// ─── Week boundary helpers ────────────────────────────────────────────────────

function getCurrentWeekQuery() {
  const weekStart = getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return {
    weekStart,
    weekEnd,
    query: {
      $or: [
        {
          date: {
            $gte: weekStart.toISOString().split("T")[0],
            $lt: weekEnd.toISOString().split("T")[0],
          },
        },
        {
          createdAt: {
            $gte: weekStart,
            $lt: weekEnd,
          },
        },
      ],
    },
  };
}

function isMongoConnectionError(error) {
  const message = error?.message || "";
  return (
    message.includes("MONGODB_URI") ||
    message.includes("connect") ||
    message.includes("MongoServerSelectionError") ||
    message.includes("SSL routines") ||
    message.includes("tlsv1 alert") ||
    error?.code === "ECONNREFUSED"
  );
}

// ─── Import articles from Google News RSS ────────────────────────────────────

async function importWeeklyArticles(db) {
  const { weekStart, query } = getCurrentWeekQuery();
  const currentWeekCount = await db.collection("articles").countDocuments(query);
  const remainingSlots = Math.max(0, WEEKLY_ARTICLE_TOTAL_LIMIT - currentWeekCount);

  if (remainingSlots === 0) {
    logInfo("Weekly article pool is full, skipping import", {
      count: currentWeekCount,
      limit: WEEKLY_ARTICLE_TOTAL_LIMIT,
    });
    return { imported: 0, skipped: 0, total: currentWeekCount };
  }

  // Fetch real articles from Google News RSS feeds
  let fetched = [];
  try {
    fetched = await fetchGoogleNewsArticles(WEEKLY_ARTICLE_TOTAL_LIMIT);
    logInfo(`Fetched ${fetched.length} articles from Google News RSS`);
  } catch (error) {
    logWarn("Google News RSS fetch failed, skipping import this run", {
      error: error.message,
    });
    return { imported: 0, skipped: 0, total: currentWeekCount };
  }

  let imported = 0;
  let skipped = 0;

  for (const article of fetched) {
    if (imported >= remainingSlots) {
      skipped += 1;
      continue;
    }

    const existing = await getArticleByUrl(db, article.url);
    if (existing) {
      skipped += 1;
      continue;
    }

    await db.collection("articles").insertOne({
      ...article,
      digestWeekStart: weekStart,
      weeklyRole: "archive",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    imported += 1;
  }

  return {
    imported,
    skipped,
    total: currentWeekCount + imported,
  };
}

// ─── Mark digest vs archive roles ────────────────────────────────────────────

async function markWeeklyDigestRoles(db, digestResult) {
  const { weekStart, query } = getCurrentWeekQuery();
  const digestUrls = (digestResult?.topArticles || [])
    .map((article) => article.url)
    .filter(Boolean);

  // All articles this week default to "archive"
  await db.collection("articles").updateMany(query, {
    $set: {
      digestWeekStart: weekStart,
      weeklyRole: "archive",
      updatedAt: new Date(),
    },
  });

  // Top 15 digest articles get "digest" role
  if (digestUrls.length) {
    await db.collection("articles").updateMany(
      { url: { $in: digestUrls } },
      {
        $set: {
          digestWeekStart: weekStart,
          weeklyRole: "digest",
          updatedAt: new Date(),
        },
      }
    );
  }
}

// ─── POST: full weekly refresh ────────────────────────────────────────────────

/**
 * POST /api/articles/refresh
 *   • Fetches fresh articles from Google News RSS
 *   • Inserts new articles into MongoDB (up to 30 per week)
 *   • Picks top 15 for the weekly digest and generates Groq summaries
 *   • Publishes the weekly digest document
 *
 * GET /api/articles/refresh
 *   • Returns timestamp and stats of the last completed refresh
 */
export async function POST(req) {
  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Allow unauthenticated access in dev, or when DB is empty (first-run bootstrap)
    let allowPublicFetch = false;
    try {
      const db = await connectToDatabase();
      const articleCount = await db.collection("articles").countDocuments();
      allowPublicFetch = articleCount < 5;
    } catch {
      allowPublicFetch = false;
    }

    if (process.env.NODE_ENV === "development") {
      // Development: always allow
    } else if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        const { getServerSession } = await import("next-auth/next");
        const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "admin" && !allowPublicFetch)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    } else if (!allowPublicFetch) {
      const { getServerSession } = await import("next-auth/next");
      const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const result = await queueRefreshRequest(async () => {
      const db = await connectToDatabase();
      logInfo("Starting article refresh from Google News RSS");

      // Ensure URL uniqueness index exists
      await db.collection("articles").createIndex({ url: 1 }, { unique: true }).catch(() => {});

      // 1. Pull fresh articles from RSS and persist new ones
      const fetchResult = await importWeeklyArticles(db);

      // 2. Build / update the weekly digest document
      await ensureWeeklyDigestIndexes(db);
      let digestResult = await createOrUpdateWeeklyDigest(db, { status: "published" });

      // 3. Generate Groq summaries for the 15 digest articles (skip if already summarised)
      let summariesGenerated = 0;
      const groqApiKey = process.env.GROQ_API_KEY;

      if (groqApiKey && groqApiKey !== "your_groq_api_key_here") {
        for (const article of digestResult.topArticles.slice(0, WEEKLY_DIGEST_ARTICLE_LIMIT)) {
          if (!article.url) continue;

          const hasSummary = article.summary && article.summary.trim().length > 20;
          if (hasSummary) {
            summariesGenerated += 1;
            continue;
          }

          try {
            const summary = await generateSummaryWithGroq({ apiKey: groqApiKey, article });
            if (summary) {
              await updateArticleSummary(db, article.url, summary);
              summariesGenerated += 1;
              logInfo("Generated Groq summary", { url: article.url });
            }
          } catch (error) {
            logWarn("Summary generation failed for article", {
              url: article.url,
              error: error.message,
            });
          }
        }

        // Re-build digest so it picks up the fresh summaries just written
        digestResult = await createOrUpdateWeeklyDigest(db, { status: "published" });
      } else {
        logWarn("Groq summaries skipped — GROQ_API_KEY is not configured");
      }

      // 4. Tag every current-week article as archive or digest
      await markWeeklyDigestRoles(db, digestResult);

      // 5. Write a refresh log entry
      const refreshTimestamp = new Date();
      try {
        await db.collection("refresh_logs").insertOne({
          timestamp: refreshTimestamp,
          articlesImported: fetchResult.imported,
          articlesSkipped: fetchResult.skipped,
          summariesGenerated,
          digestArticles: digestResult?.topArticles?.length || 0,
          weeklyArticleLimit: WEEKLY_ARTICLE_TOTAL_LIMIT,
          duration: Date.now() - startTime,
          source: "google-news-rss",
        });
      } catch (e) {
        logError("Error writing refresh log", e);
      }

      logInfo("Refresh completed", {
        duration: Date.now() - startTime,
        imported: fetchResult.imported,
        skipped: fetchResult.skipped,
        summariesGenerated,
        digestArticles: digestResult?.topArticles?.length || 0,
      });

      return {
        success: true,
        message: "Refresh completed",
        data: {
          articlesImported: fetchResult.imported,
          articlesSkipped: fetchResult.skipped,
          summariesGenerated,
          digestArticles: digestResult?.topArticles?.length || 0,
          weeklyArticleLimit: WEEKLY_ARTICLE_TOTAL_LIMIT,
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

// ─── GET: last refresh info ───────────────────────────────────────────────────

export async function GET() {
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
        weeklyArticleLimit: lastRefresh?.weeklyArticleLimit || WEEKLY_ARTICLE_TOTAL_LIMIT,
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
    if (isMongoConnectionError(error)) {
      return new Response(
        JSON.stringify({
          lastRefresh: null,
          articlesImported: 0,
          summariesGenerated: 0,
          weeklyArticleLimit: WEEKLY_ARTICLE_TOTAL_LIMIT,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        }
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
