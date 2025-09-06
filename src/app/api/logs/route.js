import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * API endpoint for logging errors
 * POST /api/logs
 */
export async function POST(request) {
  try {
    const errorData = await request.json();

    // Validate the error data
    if (!errorData.message && !errorData.timestamp) {
      return NextResponse.json(
        { error: "Invalid error data" },
        { status: 400 }
      );
    }

    // In production, you might want to store errors in a database
    if (process.env.NODE_ENV === "production") {
      await logToDatabase(errorData);
    }

    // Always log to console for immediate visibility
    console.error("🚨 Application Error:", {
      timestamp: errorData.timestamp,
      message: errorData.message,
      stack: errorData.stack,
      url: errorData.url,
      context: errorData.context,
      level: errorData.level,
    });

    // You can also send to external services here
    // await sendToExternalService(errorData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process error log:", error);
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 });
  }
}

/**
 * Store error in database (optional)
 */
async function logToDatabase(errorData) {
  try {
    const { db } = await connectToDatabase();

    // Create error log document
    const errorLog = {
      ...errorData,
      createdAt: new Date(),
      // Add any additional fields you want to track
    };

    // Store in errors collection
    await db.collection("errorLogs").insertOne(errorLog);
  } catch (dbError) {
    console.error("Failed to store error in database:", dbError);
    // Don't throw - we don't want logging failures to break the app
  }
}

/**
 * Send to external logging service (optional)
 * Uncomment and configure as needed
 */
// async function sendToExternalService(errorData) {
//   // Example: Send to Sentry
//   // Sentry.captureException(new Error(errorData.message), {
//   //   extra: errorData.context,
//   //   tags: {
//   //     url: errorData.url,
//   //     environment: errorData.context?.environment,
//   //   }
//   // });
// }
