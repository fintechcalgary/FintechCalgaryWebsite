import { connectToDatabase } from "@/lib/mongodb";
import { getArticles, createArticles, getArticleByUrl, updateArticleSummary } from "@/lib/models/article";
import { fetchGoogleNewsArticles, isMongoConnectionError } from "@/lib/googleNewsRss";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

// ─── GET /api/articles ────────────────────────────────────────────────────────
// Fetch articles with optional filters (date, source, url, hasSummary, limit, sortBy)
// Falls back to live Google News RSS when MongoDB is unreachable.

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const db = await connectToDatabase();

    const articles = await getArticles(db, {
      date: searchParams.get("date") || undefined,
      source: searchParams.get("source") || undefined,
      url: searchParams.get("url") || undefined,
      weeklyRole: searchParams.get("weeklyRole") || undefined,
      hasSummary:
        searchParams.get("hasSummary") === "true"
          ? true
          : searchParams.get("hasSummary") === "false"
          ? false
          : undefined,
      limit: parseInt(searchParams.get("limit") || "100", 10),
      sortBy: searchParams.get("sortBy") || "date_desc",
    });

    return new Response(JSON.stringify(articles), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /api/articles error:", error);

    if (isMongoConnectionError(error)) {
      try {
        const articles = await fetchGoogleNewsArticles(30);
        return new Response(JSON.stringify(articles), {
          status: 200,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      } catch (rssError) {
        console.error("RSS fallback failed:", rssError.message);
      }
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

// ─── POST /api/articles ───────────────────────────────────────────────────────
// Admin-only: manually create articles from an array.

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { articles } = body;

    if (!Array.isArray(articles) || articles.length === 0) {
      return new Response(
        JSON.stringify({ error: "Provide a non-empty 'articles' array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectToDatabase();

    // Skip articles that already exist (url uniqueness)
    const newArticles = [];
    for (const article of articles) {
      const existing = await getArticleByUrl(db, article.url);
      if (!existing) newArticles.push(article);
    }

    if (newArticles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "All articles already exist", imported: 0, skipped: articles.length }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await createArticles(db, newArticles);
    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${result.insertedCount} articles`,
        imported: result.insertedCount,
        skipped: articles.length - result.insertedCount,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("POST /api/articles error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ─── PUT /api/articles ────────────────────────────────────────────────────────
// Update the summary for a single article identified by URL.

export async function PUT(req) {
  try {
    const body = await req.json();
    const { url, summary } = body;

    if (!url || summary === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: url, summary" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectToDatabase();
    const result = await updateArticleSummary(db, url, summary);

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Article not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, modifiedCount: result.modifiedCount }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PUT /api/articles error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
