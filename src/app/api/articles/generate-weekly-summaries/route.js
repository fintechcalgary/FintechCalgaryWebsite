import { connectToDatabase } from "@/lib/mongodb";
import { getArticles, updateArticleSummary } from "@/lib/models/article";

export const dynamic = "force-dynamic";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function generateSummaryWithGemini({ apiKey, article }) {
  const prompt = [
    "Write a concise 2-3 sentence summary of this fintech news article for a professional audience.",
    "Focus on the key development, its significance, and potential impact on the industry.",
    "",
    `Title: ${article.title}`,
    `Source: ${article.source || "Unknown"}`,
    "",
    "Respond with only the summary text. No markdown, no asterisks, no bullet points.",
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Gemini request failed (${response.status})${errorText ? `: ${errorText.slice(0, 200)}` : ""}`
    );
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("").trim() || "";

  if (!text) return null;

  const cleaned = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^Summary:\s*/i, "").trim();
  if (cleaned.length < 20) return null;
  return cleaned.length > 500 ? `${cleaned.slice(0, 500)}...` : cleaned;
}

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectToDatabase();
    
    // Get articles without summaries (limit to 15 for weekly digest)
    const articles = await getArticles(db, {
      hasSummary: false,
      limit: 15,
      sortBy: "date_desc"
    });

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No articles without summaries found",
          processed: 0
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      
      try {
        const summary = await generateSummaryWithGemini({ apiKey, article });
        
        if (summary) {
          await updateArticleSummary(db, article.url, summary);
          results.push({
            url: article.url,
            title: article.title,
            summary: summary.substring(0, 100) + "...",
            status: "success"
          });
        } else {
          results.push({
            url: article.url,
            title: article.title,
            status: "failed",
            error: "Empty summary generated"
          });
        }
      } catch (error) {
        console.error(`Failed to generate summary for ${article.title}:`, error.message);
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
        results: results
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-weekly-summaries:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
