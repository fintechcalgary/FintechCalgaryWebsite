import { connectToDatabase } from "@/lib/mongodb";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";
import { updateExecutive } from "@/lib/models/executive";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req, context) => {
  const { executiveId } = await context.params;
  const db = await connectToDatabase();

  const executive = await db.collection("executives").findOne({
    _id: new ObjectId(executiveId),
  });

  if (!executive) {
    return apiResponse.notFound("Executive not found");
  }

  return apiResponse.success(executive);
});

export const PUT = withErrorHandler(async (req, context) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { executiveId } = await context.params;
  const db = await connectToDatabase();
  const updates = await req.json();

  if (updates.role && !["admin", "member"].includes(updates.role)) {
    return apiResponse.badRequest("Invalid role value");
  }

  const result = await updateExecutive(db, executiveId, updates);
  return apiResponse.success(result);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { executiveId } = await context.params;
  const db = await connectToDatabase();

  await db.collection("executives").deleteOne({
    _id: new ObjectId(executiveId),
  });

  return new Response(null, { status: 204 });
});

