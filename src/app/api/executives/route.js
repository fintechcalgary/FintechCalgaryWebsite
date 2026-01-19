import { connectToDatabase } from "@/lib/mongodb";
import { createExecutive, getExecutives } from "@/lib/models/executive";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const executive = await req.json();

  // Check if username already exists
  const existingExecutive = await db
    .collection("executives")
    .findOne({ username: executive.username });

  if (existingExecutive) {
    return apiResponse.badRequest("Username already exists");
  }

  const result = await db.collection("executives").insertOne(executive);
  return apiResponse.success(result, 201);
});

export const GET = withErrorHandler(async () => {
  const db = await connectToDatabase();
  const executives = await getExecutives(db);
  return apiResponse.success(executives, 200);
});

