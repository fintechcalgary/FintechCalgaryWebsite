import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentWeeklyDigest, createOrUpdateWeeklyDigest } from "@/lib/models/weeklyDigest";
import { getArticles } from "@/lib/models/article";

export const dynamic = "force-dynamic";

export async function POST(_req) {
  try {
    const db = await connectToDatabase();
    
    // Get current weekly digest
    const currentDigest = await getCurrentWeeklyDigest(db);
    
    // Get recent articles with summaries
    const articlesWithSummaries = await getArticles(db, {
      limit: 15,
      sortBy: "date_desc",
      hasSummary: true
    });

    if (articlesWithSummaries.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No articles with summaries found",
          updated: false
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update weekly digest with summarized articles
    const today = new Date();
    const updatedDigest = await createOrUpdateWeeklyDigest(db, {
      weekStart: currentDigest?.weekStart || today,
      weekEnd: currentDigest?.weekEnd || today,
      articles: articlesWithSummaries,
      stats: currentDigest?.stats || {
        topics: [],
        sentiment: { positive: 0, negative: 0, neutral: 0, total: articlesWithSummaries.length }
      }
    });

    return new Response(
      JSON.stringify({
        message: `Updated weekly digest with ${articlesWithSummaries.length} summarized articles`,
        updated: true,
        articlesCount: articlesWithSummaries.length,
        digestId: updatedDigest?._id
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error updating weekly digest:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
