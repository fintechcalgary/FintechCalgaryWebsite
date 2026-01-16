import { connectToDatabase } from "@/lib/mongodb";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";
import { updateMember } from "@/lib/models/member";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req, context) => {
  const { memberId } = await context.params;
  const db = await connectToDatabase();

  const member = await db.collection("members").findOne({
    _id: new ObjectId(memberId),
  });

  if (!member) {
    return apiResponse.notFound("Member not found");
  }

  return apiResponse.success(member);
});

export const PUT = withErrorHandler(async (req, context) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { memberId } = await context.params;
  const db = await connectToDatabase();
  const updates = await req.json();

  if (updates.role && !["admin", "member"].includes(updates.role)) {
    return apiResponse.badRequest("Invalid role value");
  }

  const result = await updateMember(db, memberId, updates);
  return apiResponse.success(result);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { memberId } = await context.params;
  const db = await connectToDatabase();

  await db.collection("members").deleteOne({
    _id: new ObjectId(memberId),
  });

  return new Response(null, { status: 204 });
});
