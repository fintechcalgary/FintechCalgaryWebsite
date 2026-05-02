import { connectToDatabase } from "@/lib/mongodb";
import { getArticles, createArticles, getArticleByUrl } from "@/lib/models/article";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dynamic = "force-dynamic";

// GET - Fetch articles with optional filters
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const source = searchParams.get("source");
    const url = searchParams.get("url");
    const hasSummary = searchParams.get("hasSummary");
    const limit = parseInt(searchParams.get("limit") || "100");
    const sortBy = searchParams.get("sortBy") || "date_desc";

    const db = await connectToDatabase();

    const filters = {
      date,
      source,
      url: url || undefined,
      hasSummary: hasSummary === "true" ? true : hasSummary === "false" ? false : undefined,
      limit,
      sortBy,
    };

    const articles = await getArticles(db, filters);

    return new Response(JSON.stringify(articles), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/articles - Error:", error);

    const isConnectionError = error.message?.includes("MONGODB_URI") ||
                             error.message?.includes("connect") ||
                             error.code === "ECONNREFUSED" ||
                             error.message?.includes("MongoServerSelectionError");

    if (isConnectionError) {
      console.warn("MongoDB not available, returning empty articles array");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
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

// POST - Trigger article fetching or create articles manually
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const { action, articles } = body;

    const db = await connectToDatabase();

    if (action === "fetch") {
      try {
        const backendDir = path.join(process.cwd(), "backend");
        const scriptPath = path.join(backendDir, "fetch_finance_news.py");

        const { stdout, stderr } = await execAsync(
          `python3 "${scriptPath}"`,
          { cwd: backendDir }
        );

        console.log("Python script output:", stdout);
        if (stderr) {
          console.error("Python script errors:", stderr);
        }

        const fs = await import("fs");
        const dataDir = path.join(backendDir, "data");

        const files = fs.readdirSync(dataDir)
          .filter(f => f.startsWith("finance_news_") && f.endsWith(".json"))
          .sort()
          .reverse();

        if (files.length > 0) {
          const latestFile = path.join(dataDir, files[0]);
          const fileContent = fs.readFileSync(latestFile, "utf-8");
          const articlesFromFile = JSON.parse(fileContent);

          let imported = 0;
          let skipped = 0;

          for (const article of articlesFromFile) {
            const existing = await getArticleByUrl(db, article.url);
            if (!existing) {
              await createArticles(db, [article]);
              imported++;
            } else {
              skipped++;
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: `Fetched articles successfully`,
              imported,
              skipped,
              total: articlesFromFile.length,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Fetch completed but no new articles found",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Error running Python script:", error);
        return new Response(
          JSON.stringify({
            error: "Failed to fetch articles",
            details: error.message,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    if (articles && Array.isArray(articles)) {
      const newArticles = [];
      for (const article of articles) {
        const existing = await getArticleByUrl(db, article.url);
        if (!existing) {
          newArticles.push(article);
        }
      }

      if (newArticles.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "All articles already exist",
            imported: 0,
            skipped: articles.length,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
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
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request. Provide 'action: fetch' or 'articles' array" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("POST /api/articles - Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
