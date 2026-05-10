import { connectToDatabase } from "@/lib/mongodb";
import { getMembers } from "@/lib/models/member";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";

export const GET = withErrorHandler(async () => {
  const { error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const members = await getMembers(db);

  return apiResponse.success(members);
});

