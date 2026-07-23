import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// Development-only endpoint.
// Clears the articles collection and inserts a small set of seed articles for
// local testing.  Blocked entirely in production so it can never be triggered
// accidentally or by an attacker.

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return new Response(
      JSON.stringify({ error: "This endpoint is only available in development" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const startTime = Date.now();

  try {
    const db = await connectToDatabase();

    // Wipe + re-seed — development only
    await db.collection("articles").deleteMany({});

    const seedArticles = [
      {
        title: "Fintech Funding Rounds Hit Record High in Q2",
        url: "https://example.com/fintech-funding-q2",
        source: "TechCrunch",
        date: new Date().toISOString().split("T")[0],
        publishedAt: new Date().toISOString(),
        categories: ["fintech", "funding", "startup"],
        summary: "Global fintech funding rounds exceeded $25 billion in Q2, driven by AI-powered payment platforms and embedded finance solutions.",
        weeklyRole: "digest",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Open Banking Adoption Surges Across Europe",
        url: "https://example.com/open-banking-europe",
        source: "Financial Times",
        date: new Date().toISOString().split("T")[0],
        publishedAt: new Date().toISOString(),
        categories: ["open banking", "regulation", "europe"],
        summary: "Open banking API usage in Europe grew 60% year-over-year as PSD3 implementation drives standardization and new consumer-facing products.",
        weeklyRole: "digest",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Stablecoin Payments Volume Doubles in 12 Months",
        url: "https://example.com/stablecoin-payments",
        source: "Bloomberg",
        date: new Date().toISOString().split("T")[0],
        publishedAt: new Date().toISOString(),
        categories: ["crypto", "stablecoin", "payments"],
        summary: "On-chain stablecoin payment volumes doubled to $10 trillion annualized, with Visa and Mastercard expanding their stablecoin settlement rails.",
        weeklyRole: "archive",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = await db.collection("articles").insertMany(seedArticles);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test seed completed (development only)",
        data: {
          articlesInserted: result.insertedCount,
          duration: Date.now() - startTime,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("test-refresh error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
