import { connectToDatabase } from "@/lib/mongodb";
import { getArticles, updateArticleSummary } from "@/lib/models/article";
import { fetchGoogleNewsArticles, isMongoConnectionError } from "@/lib/googleNewsRss";

export const dynamic = "force-dynamic";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function generateSummaryWithGemini({ apiKey, article }) {
  const prompt = [
    "You are a financial news analyst.",
    "Generate a concise factual 2-3 sentence summary for this fintech article.",
    `Title: ${article.title || ""}`,
    `Source: ${article.source || ""}`,
    `Date: ${article.date || article.publishedAt || ""}`,
    "Summary:",
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Gemini request failed (${response.status})${errorText ? `: ${errorText.slice(0, 180)}` : ""}`);
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
    const body = await req.json();
    const maxArticles = Math.min(Number(body?.maxArticles || 1), 10);
    const articleUrl = body?.articleUrl;
    const fallbackArticle = body?.article && typeof body.article === "object" ? body.article : null;

    const geminiApiKey = process.env.GEMINI_API || process.env.GEMINI_API_KEY;
    if (!geminiApiKey || geminiApiKey === "your_gemini_api_key_here") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GEMINI_API environment variable not set",
          suggestion: "Set GEMINI_API in .env.local and restart the dev server.",
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
        const summary = await generateSummaryWithGemini({ apiKey: geminiApiKey, article });
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
              error: "Gemini summary generation failed",
              details: process.env.NODE_ENV === "development" ? error.message : undefined,
              suggestion: "Check that GEMINI_API or GEMINI_API_KEY is a valid Google Gemini API key, then restart the server.",
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
