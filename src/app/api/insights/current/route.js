import { connectToDatabase } from "@/lib/mongodb";
import {
  getCurrentWeeklyDigest,
  getLatestPublishedWeeklyDigest,
  WEEKLY_DIGEST_ARTICLE_LIMIT,
} from "@/lib/models/weeklyDigest";
import { getLiveWeeklyDigest, isMongoConnectionError } from "@/lib/googleNewsRss";

export const dynamic = "force-dynamic";

// ─── helpers ─────────────────────────────────────────────────────────────────

function digestResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function liveRssFallback() {
  const live = await getLiveWeeklyDigest();
  return digestResponse({
    weekStart: live.weekStart,
    weekEnd: live.weekEnd,
    stats: live.stats,
    articles: live.articles,
    count: live.count,
    source: live.source,
  });
}

// ─── GET /api/insights/current ───────────────────────────────────────────────
//
// Priority:
//   1. Published weekly digest from MongoDB for the current week
//   2. Latest published MongoDB digest while the next scheduled refresh is pending
//   3. Live Google News RSS fallback (when DB is empty or unreachable)
//   4. Empty response (if RSS also fails)

export async function GET() {
  try {
    const db = await connectToDatabase();
    const digest = await getCurrentWeeklyDigest(db);

    if (digest && digest.articles.length > 0) {
      return digestResponse({
        weekStart: digest.weekStart,
        weekEnd: digest.weekEnd,
        stats: digest.stats || null,
        articles: digest.articles.slice(0, WEEKLY_DIGEST_ARTICLE_LIMIT),
        count: digest.articles.length,
      });
    }

    const latestDigest = await getLatestPublishedWeeklyDigest(db);
    if (latestDigest && latestDigest.articles.length > 0) {
      return digestResponse({
        weekStart: latestDigest.weekStart,
        weekEnd: latestDigest.weekEnd,
        stats: latestDigest.stats || null,
        articles: latestDigest.articles.slice(0, WEEKLY_DIGEST_ARTICLE_LIMIT),
        count: latestDigest.articles.length,
        source: "latest-published-digest",
      });
    }

    // DB connected but no digest has been published yet — use live RSS
    return await liveRssFallback();
  } catch (error) {
    console.error("GET /api/insights/current error:", error);

    if (isMongoConnectionError(error)) {
      try {
        return await liveRssFallback();
      } catch (rssError) {
        console.error("Live RSS fallback failed:", rssError.message);
      }
    }

    return digestResponse({
      weekStart: null,
      weekEnd: null,
      stats: null,
      articles: [],
      count: 0,
      error: process.env.NODE_ENV === "development" ? error.message : "Failed to load insights",
    });
  }
}
