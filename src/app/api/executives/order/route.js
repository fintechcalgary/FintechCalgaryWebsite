import { connectToDatabase } from "@/lib/mongodb";
import { updateExecutiveOrder } from "@/lib/models/executive";
import { apiResponse, requireAdmin, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

export const PUT = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const { orderedExecutiveIds } = await req.json();

  // Validate the input
  const arrayError = validators.array(orderedExecutiveIds, "orderedExecutiveIds");
  if (arrayError) {
    return apiResponse.badRequest(arrayError);
  }
  if (!orderedExecutiveIds || orderedExecutiveIds.length === 0) {
    return apiResponse.badRequest("orderedExecutiveIds must be a non-empty array");
  }

  await updateExecutiveOrder(db, orderedExecutiveIds);

  logger.logUserAction("update_executive_order", { count: orderedExecutiveIds.length });
  return apiResponse.success({ success: true });
});

