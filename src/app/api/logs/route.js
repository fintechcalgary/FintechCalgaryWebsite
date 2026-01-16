import { connectToDatabase } from "@/lib/mongodb";
import { apiResponse, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

/**
 * Store error in database (optional)
 */
async function logToDatabase(errorData) {
  try {
    const db = await connectToDatabase();
    const errorLog = {
      ...errorData,
      createdAt: new Date(),
    };
    await db.collection("errorLogs").insertOne(errorLog);
  } catch (dbError) {
    logger.logApiError("/api/logs", dbError);
    // Don't throw - we don't want logging failures to break the app
  }
}

export const POST = withErrorHandler(async (request) => {
  const errorData = await request.json();

  // Validate the error data
  if (!errorData.message && !errorData.timestamp) {
    return apiResponse.badRequest("Invalid error data");
  }

  // Store errors in database (can be enabled for development testing too)
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_DB_LOGGING === "true"
  ) {
    await logToDatabase(errorData);
  }

  // Log the error using the logger utility
  logger.log(errorData.message || "Unknown error", {
    ...errorData.context,
    stack: errorData.stack,
    url: errorData.url,
    level: errorData.level,
  });

  return apiResponse.success({ success: true });
});

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
