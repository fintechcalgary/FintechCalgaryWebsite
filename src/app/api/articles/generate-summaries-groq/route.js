import { connectToDatabase } from "@/lib/mongodb";
import { getArticles, updateArticleSummary } from "@/lib/models/article";

export const dynamic = "force-dynamic";

async function generateSummaryWithGroq(article) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const prompt = [
    "Write a concise 2-3 sentence summary of this fintech news article for a professional audience.",
    "Focus on the key development, its significance, and potential impact on the industry.",
    "",
    `Title: ${article.title}`,
    `Source: ${article.source || "Unknown"}`,
    "",
    "Respond with only the summary text. No markdown, no asterisks, no bullet points.",
  ].join("\n");

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 150
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Groq request failed (${response.status})`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) return null;

    const cleaned = summary.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^Summary:\s*/i, "").trim();
    if (cleaned.length < 20) return null;
    return cleaned.length > 500 ? `${cleaned.slice(0, 500)}...` : cleaned;
    
  } catch (error) {
    console.error('Groq generation error:', error.message);
    throw error;
  }
}

export async function POST(_req) {
  try {
    const db = await connectToDatabase();
    
    // Get recent articles for summary generation
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
    
    // Process articles in parallel for speed (max 3 concurrent)
    const batchSize = 3;
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (article) => {
        try {
          const summary = await generateSummaryWithGroq(article);
          
          if (summary) {
            await updateArticleSummary(db, article.url, summary);
            return {
              url: article.url,
              title: article.title,
              summary: summary.substring(0, 100) + "...",
              status: "success"
            };
          } else {
            return {
              url: article.url,
              title: article.title,
              status: "failed",
              error: "Empty summary generated"
            };
          }
        } catch (error) {
          return {
            url: article.url,
            title: article.title,
            status: "failed",
            error: error.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(articles.length/batchSize)}`);
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${articles.length} articles using Groq (Llama 3 8B) - FAST & PRODUCTION READY`,
        processed: articles.length,
        successCount: results.filter(r => r.status === "success").length,
        results: results
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-summaries-groq:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
