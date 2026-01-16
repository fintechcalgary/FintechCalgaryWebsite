import { connectToDatabase } from "@/lib/mongodb";
import { apiResponse, requireAdmin, validators, withErrorHandler, DEFAULT_EXECUTIVE_QUESTIONS } from "@/lib/api-helpers";
import logger from "@/lib/logger";

export const GET = withErrorHandler(async () => {
  const db = await connectToDatabase();
  const settings = await db.collection("settings").findOne({});

  return apiResponse.success(
    settings || {
      executiveApplicationsOpen: false,
      executiveApplicationQuestions: DEFAULT_EXECUTIVE_QUESTIONS,
    }
  );
});

export const PUT = withErrorHandler(async (request) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { executiveApplicationsOpen, executiveApplicationQuestions } = body;

  // Validate the input
  if (
    executiveApplicationsOpen !== undefined &&
    typeof executiveApplicationsOpen !== "boolean"
  ) {
    return apiResponse.badRequest("executiveApplicationsOpen must be a boolean");
  }

  // Validate questions if provided
  if (executiveApplicationQuestions !== undefined) {
    const arrayError = validators.array(
      executiveApplicationQuestions,
      "executiveApplicationQuestions"
    );
    if (arrayError) {
      return apiResponse.badRequest(arrayError);
    }

    // Validate each question
    for (const question of executiveApplicationQuestions) {
      if (!question.id || !question.label) {
        return apiResponse.badRequest(
          "Each question must have an id and label"
        );
      }
    }
  }

  const db = await connectToDatabase();

  // Build update object
  const updateData = {};
  if (executiveApplicationsOpen !== undefined) {
    updateData.executiveApplicationsOpen = executiveApplicationsOpen;
  }
  if (executiveApplicationQuestions !== undefined) {
    updateData.executiveApplicationQuestions = executiveApplicationQuestions;
  }

  // Update or create settings document
  await db.collection("settings").updateOne(
    {},
    {
      $set: updateData,
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  return apiResponse.success({
    success: true,
    ...updateData,
    message: "Settings updated successfully",
  });
});

export const POST = () => apiResponse.methodNotAllowed();
export const DELETE = () => apiResponse.methodNotAllowed();
export const PATCH = () => apiResponse.methodNotAllowed();
