import { connectToDatabase } from "@/lib/mongodb";
import { getArticles, updateArticleSummary } from "@/lib/models/article";
import { callGroq } from "@/lib/groq";

export const dynamic = "force-dynamic";

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

  const cleaned = (await callGroq(apiKey, prompt, { maxTokens: 200, timeoutMs: 20000 }))
    .replace(/^Summary:\s*/i, "")
    .trim();
  if (cleaned.length < 20) return null;
  return cleaned.length > 500 ? `${cleaned.slice(0, 500)}...` : cleaned;
}

export async function POST(_req) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectToDatabase();
    
    // Get recent articles (with or without summaries) - force regeneration for top 15
    const articles = await getArticles(db, {
      limit: 15,
      sortBy: "date_desc"
    });

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No articles found",
          processed: 0
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      
      try {
        const summary = await generateSummaryWithGroq({ apiKey, article });
        
        if (summary) {
          await updateArticleSummary(db, article.url, summary);
          results.push({
            url: article.url,
            title: article.title,
            summary: summary.substring(0, 100) + "...",
            status: "success"
          });
          console.log(`Generated summary for: ${article.title}`);
        } else {
          results.push({
            url: article.url,
            title: article.title,
            status: "failed",
            error: "Empty summary generated"
          });
          console.log(`Failed to generate summary for: ${article.title}`);
        }
      } catch (error) {
        console.error(`Error generating summary for ${article.title}:`, error.message);
        results.push({
          url: article.url,
          title: article.title,
          status: "failed",
          error: error.message
        });
      }

      // Small delay between requests to avoid rate limiting
      if (i < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${articles.length} articles`,
        processed: articles.length,
        successCount: results.filter(r => r.status === "success").length,
        results: results
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in force-generate-summaries:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
