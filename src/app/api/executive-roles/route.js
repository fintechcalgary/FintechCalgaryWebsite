import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { apiResponse, requireAdmin, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

export const POST = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const data = await req.json();

  // Basic validation
  if (!data.title || !data.responsibilitiesImageUrl) {
    return apiResponse.badRequest(
      "Title and responsibilities image are required"
    );
  }

  // Validate questions if provided
  if (data.questions) {
    const arrayError = validators.array(data.questions, "questions");
    if (arrayError) {
      return apiResponse.badRequest(arrayError);
    }

    // Validate each question
    for (const question of data.questions) {
      if (!question.id || !question.label) {
        return apiResponse.badRequest(
          "Each question must have an id and label"
        );
      }
    }
  }

  const db = await connectToDatabase();
  const result = await db.collection("executiveRoles").insertOne({
    title: data.title,
    responsibilitiesImageUrl: data.responsibilitiesImageUrl,
    questions: data.questions || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return apiResponse.success({
    success: true,
    roleId: result.insertedId,
  });
});

export const GET = withErrorHandler(async () => {
  const db = await connectToDatabase();
  const roles = await db
    .collection("executiveRoles")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return apiResponse.success(roles);
});

export const PUT = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const data = await req.json();
  const { id, title, responsibilitiesImageUrl, questions } = data;

  if (!id || !title || !responsibilitiesImageUrl) {
    return apiResponse.badRequest(
      "ID, title, and responsibilities image are required"
    );
  }

  // Validate questions if provided
  if (questions) {
    const arrayError = validators.array(questions, "questions");
    if (arrayError) {
      return apiResponse.badRequest(arrayError);
    }

    // Validate each question
    for (const question of questions) {
      if (!question.id || !question.label) {
        return apiResponse.badRequest(
          "Each question must have an id and label"
        );
      }
    }
  }

  const db = await connectToDatabase();
  const updateData = {
    title,
    responsibilitiesImageUrl,
    updatedAt: new Date(),
  };

  // Only update questions if provided
  if (questions !== undefined) {
    updateData.questions = questions;
  }

  const result = await db.collection("executiveRoles").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: updateData,
    }
  );

  if (result.matchedCount === 0) {
    return apiResponse.notFound("Role not found");
  }

  return apiResponse.success({ success: true });
});

export const DELETE = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return apiResponse.badRequest("Role ID is required");
  }

  const db = await connectToDatabase();
  const result = await db.collection("executiveRoles").deleteOne({
    _id: new ObjectId(id),
  });

  if (result.deletedCount === 0) {
    return apiResponse.notFound("Role not found");
  }

  return apiResponse.success({ success: true });
});
