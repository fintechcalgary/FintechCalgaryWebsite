import { connectToDatabase } from "@/lib/mongodb";
import { apiResponse, validators, withErrorHandler, DEFAULT_EXECUTIVE_QUESTIONS } from "@/lib/api-helpers";
import logger from "@/lib/logger";

export const POST = withErrorHandler(async (req) => {
  const data = await req.json();

  const db = await connectToDatabase();
  const settings = await db.collection("settings").findOne({});

  // Get role-specific questions
  const selectedRole = await db.collection("executiveRoles").findOne({
    title: data.role,
  });

  // Use role-specific questions if available, otherwise use general questions
  const questions =
    selectedRole?.questions?.length > 0
      ? selectedRole.questions
      : settings?.executiveApplicationQuestions || DEFAULT_EXECUTIVE_QUESTIONS;

  // Basic validation for required fields
  const requiredFields = ["name", "email", "program", "year", "role"];
  const validationError = validators.requiredFields(data, requiredFields);
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  // Validate email format
  const emailError = validators.email(data.email);
  if (emailError) {
    return apiResponse.badRequest(emailError);
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

  await db.collection("executiveApplications").insertOne({
    ...data,
    createdAt: new Date(),
  });

  logger.logUserAction("submit_executive_application", { role: data.role });
  return apiResponse.success({ success: true });
});

export async function GET(req) {
  try {
    const db = await connectToDatabase();
    const applications = await db
      .collection("executiveApplications")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Failed to fetch executive applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection("executiveApplications").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete executive application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
