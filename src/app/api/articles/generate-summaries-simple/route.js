import { connectToDatabase } from "@/lib/mongodb";
import { getArticles, updateArticleSummary } from "@/lib/models/article";
import { fetchGoogleNewsArticles, isMongoConnectionError } from "@/lib/googleNewsRss";
import { callGroq } from "@/lib/groq";

export const dynamic = "force-dynamic";

async function generateSummaryWithGroq({ apiKey, article }) {
  const prompt = [
    "Write a concise 2-3 sentence summary of this fintech news article for a professional audience.",
    "Focus on the key development, its significance, and potential impact on the industry.",
    "",
    `Title: ${article.title || ""}`,
    `Source: ${article.source || ""}`,
    `Date: ${article.date || article.publishedAt || ""}`,
    "",
    "Respond with only the summary text. No markdown, no asterisks, no bullet points.",
  ].join("\n");

  const cleaned = (await callGroq(apiKey, prompt, { maxTokens: 200, timeoutMs: 20000 }))
    .replace(/^Summary:\s*/i, "")
    .trim();
  if (cleaned.length < 20) return null;
  return cleaned.length > 500 ? `${cleaned.slice(0, 500)}...` : cleaned;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const maxArticles = Math.min(Number(body?.maxArticles || 1), 10);
    const articleUrl = body?.articleUrl;
    const fallbackArticle = body?.article && typeof body.article === "object" ? body.article : null;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey || groqApiKey === "your_groq_api_key_here") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GROQ_API_KEY environment variable not set",
          suggestion: "Set GROQ_API_KEY in .env.local and restart the dev server.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let candidates = [];
    let db = null;
    try {
      db = await connectToDatabase();
      if (articleUrl) {
        candidates = await getArticles(db, { url: articleUrl, limit: 1 });
      } else {
        candidates = await getArticles(db, { hasSummary: false, limit: maxArticles, sortBy: "date_desc" });
      }
    } catch (error) {
      if (!isMongoConnectionError(error)) throw error;
      console.warn("MongoDB unavailable for summary generation; using request/RSS article context");
    }

    if (!candidates.length && fallbackArticle?.url) {
      candidates = [fallbackArticle];
    }

    if (!candidates.length && articleUrl) {
      const liveArticles = await fetchGoogleNewsArticles(30);
      candidates = liveArticles.filter((article) => article.url === articleUrl).slice(0, 1);
    }

    if (!candidates.length) {
      return new Response(
        JSON.stringify({ success: true, message: "No matching articles found.", generated: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    let generated = 0;
    let latestSummary = null;

    for (const article of candidates) {
      if (article.summary && article.summary.trim().length > 20) {
        latestSummary = article.summary;
        continue;
      }

      try {
        const summary = await generateSummaryWithGroq({ apiKey: groqApiKey, article });
        if (!summary) continue;

        if (db && article.url) {
          await updateArticleSummary(db, article.url, summary);
        }
        generated += 1;
        latestSummary = summary;
      } catch (error) {
        console.warn("Summary generation failed for article", article.url, error.message);
        if (articleUrl) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Groq summary generation failed",
              details: process.env.NODE_ENV === "development" ? error.message : undefined,
              suggestion: "Check that GROQ_API_KEY is valid, then restart the server.",
            }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated,
        summary: articleUrl ? latestSummary : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Summary generation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
