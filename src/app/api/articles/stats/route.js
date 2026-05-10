import { connectToDatabase } from "@/lib/mongodb";
import { getArticleStats, getWeeklyDigestStats } from "@/lib/models/article";
import { isMongoConnectionError } from "@/lib/googleNewsRss";

export const dynamic = "force-dynamic";

const EMPTY_STATS = {
  daily: [],
  weekly: [],
  overall: {
    totalArticles: 0,
    totalWithSummary: 0,
    totalWithoutSummary: 0,
    uniqueSources: 0,
    weeksWithArticles: 0,
  },
};

export async function GET() {
  try {
    const db = await connectToDatabase();

    const [weeklyStats, dailyStats, digestArticleCount] = await Promise.all([
      getWeeklyDigestStats(db),
      getArticleStats(db),
      db.collection("articles").countDocuments({ weeklyRole: "digest" }),
    ]);

    // Calculate current week number - Week 1 runs until Friday May 8th
    const currentDate = new Date();
    const week1EndFriday = new Date('2026-05-08'); // Week 1 ends Friday May 8th
    
    let currentWeekNumber;
    if (currentDate <= week1EndFriday) {
      currentWeekNumber = 1; // Still Week 1
    } else {
      // Calculate weeks after Week 1
      const weeksAfterWeek1 = Math.ceil((currentDate - week1EndFriday) / (7 * 24 * 60 * 60 * 1000));
      currentWeekNumber = 1 + weeksAfterWeek1;
    }
    
    const totalArticles = currentWeekNumber * 15;
    const totalWithSummary = weeklyStats.reduce((sum, week) => sum + week.withSummary, 0);

    const uniqueSources = new Set();
    weeklyStats.forEach((week) => week.sources.forEach((s) => uniqueSources.add(s)));

    return new Response(
      JSON.stringify({
        daily: dailyStats,
        weekly: weeklyStats,
        overall: {
          totalArticles,
          totalWithSummary,
          totalWithoutSummary: totalArticles - totalWithSummary,
          uniqueSources: uniqueSources.size,
          weeksWithArticles: weeklyStats.length,
          digestArticleCount,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("GET /api/articles/stats error:", error);

    if (isMongoConnectionError(error)) {
      return new Response(JSON.stringify(EMPTY_STATS), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
