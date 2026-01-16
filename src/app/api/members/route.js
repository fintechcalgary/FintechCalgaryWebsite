import { connectToDatabase } from "@/lib/mongodb";
import { createMember, getMembers } from "@/lib/models/member";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const member = await req.json();

  // Check if username already exists
  const existingMember = await db
    .collection("members")
    .findOne({ username: member.username });

  if (existingMember) {
    return apiResponse.badRequest("Username already exists");
  }

  const result = await db.collection("members").insertOne(member);
  return apiResponse.success(result, 201);
});

export const GET = withErrorHandler(async () => {
  const db = await connectToDatabase();
  const members = await getMembers(db);
  return apiResponse.success(members, 200);
});
