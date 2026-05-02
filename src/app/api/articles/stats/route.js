import { connectToDatabase } from "@/lib/mongodb";
import { getArticleStats } from "@/lib/models/article";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const db = await connectToDatabase();
    const stats = await getArticleStats(db);

    const totalArticles = stats.reduce((sum, day) => sum + day.count, 0);
    const totalWithSummary = stats.reduce((sum, day) => sum + day.withSummary, 0);
    const uniqueSources = new Set();
    stats.forEach(day => {
      day.sources.forEach(source => uniqueSources.add(source));
    });

    return new Response(
      JSON.stringify({
        daily: stats,
        overall: {
          totalArticles,
          totalWithSummary,
          totalWithoutSummary: totalArticles - totalWithSummary,
          uniqueSources: uniqueSources.size,
          daysWithArticles: stats.length,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/articles/stats - Error:", error);

    const isConnectionError = error.message?.includes("MONGODB_URI") ||
                             error.message?.includes("connect") ||
                             error.code === "ECONNREFUSED" ||
                             error.message?.includes("MongoServerSelectionError");

    if (isConnectionError) {
      console.warn("MongoDB not available, returning empty stats");
      return new Response(
        JSON.stringify({
          daily: [],
          overall: {
            totalArticles: 0,
            totalWithSummary: 0,
            totalWithoutSummary: 0,
            uniqueSources: 0,
            daysWithArticles: 0,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
