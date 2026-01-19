import { connectToDatabase } from "@/lib/mongodb";
import { updateMemberOrder } from "@/lib/models/member";
import { apiResponse, requireAdmin, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

export const PUT = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const { orderedMemberIds } = await req.json();

  // Validate the input
  const arrayError = validators.array(orderedMemberIds, "orderedMemberIds");
  if (arrayError) {
    return apiResponse.badRequest(arrayError);
  }
  if (!orderedMemberIds || orderedMemberIds.length === 0) {
    return apiResponse.badRequest("orderedMemberIds must be a non-empty array");
  }

  await updateMemberOrder(db, orderedMemberIds);

  logger.logUserAction("update_member_order", { count: orderedMemberIds.length });
  return apiResponse.success({ success: true });
});
