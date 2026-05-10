export const dynamic = "force-dynamic";

// Development-only health-check — returns a minimal JSON payload so you can
// confirm the API layer is responding without touching the database.

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return new Response(
      JSON.stringify({ error: "This endpoint is only available in development" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "API layer is responding", ts: new Date().toISOString() }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
