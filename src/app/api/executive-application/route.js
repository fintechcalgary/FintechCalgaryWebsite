import { connectToDatabase } from "@/lib/mongodb";
import { apiResponse, validators, withErrorHandler, DEFAULT_EXECUTIVE_QUESTIONS } from "@/lib/api-helpers";
import logger from "@/lib/logger";
import { ObjectId } from "mongodb";
import { COLLECTIONS, ERROR_MESSAGES } from "@/lib/constants";

export const POST = withErrorHandler(async (req) => {
  const data = await req.json();

  const db = await connectToDatabase();
  const settings = await db.collection(COLLECTIONS.SETTINGS).findOne({});

  // Get role-specific questions
  const selectedRole = await db.collection(COLLECTIONS.EXECUTIVE_ROLES).findOne({
    title: data.role,
  });

  // Use role-specific questions if available, otherwise use general questions
  const questions =
    selectedRole?.questions?.length > 0
      ? selectedRole.questions
      : settings?.executiveApplicationQuestions || DEFAULT_EXECUTIVE_QUESTIONS;

  // Basic validation for required fields and email
  const requiredFields = ["name", "email", "program", "year", "role"];
  const validationError = validators.validateRequiredAndEmail(data, requiredFields);
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  // Validate dynamic questions
  const missingQuestions = questions
    .filter((question) => question.required && !data[question.id])
    .map((question) => question.label || question.id);

  if (missingQuestions.length > 0) {
    return apiResponse.badRequest(
      `Missing required questions: ${missingQuestions.join(", ")}`
    );
  }

  await db.collection(COLLECTIONS.EXECUTIVE_APPLICATIONS).insertOne({
    ...data,
    createdAt: new Date(),
  });

  logger.logUserAction("submit_executive_application", { role: data.role });
  return apiResponse.success({ success: true });
});

export const GET = withErrorHandler(async () => {
  const db = await connectToDatabase();
  const applications = await db
    .collection(COLLECTIONS.EXECUTIVE_APPLICATIONS)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return apiResponse.success(applications);
});

export const DELETE = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return apiResponse.badRequest(ERROR_MESSAGES.REQUIRED_FIELD("Application ID"));
  }

  const db = await connectToDatabase();
  const result = await db.collection(COLLECTIONS.EXECUTIVE_APPLICATIONS).deleteOne({
    _id: new ObjectId(id),
  });

  if (result.deletedCount === 0) {
    return apiResponse.notFound("Application not found");
  }

  return apiResponse.success({ success: true });
});
