import { connectToDatabase } from "@/lib/mongodb";
import { updateDisplayPartnerOrder } from "@/lib/models/displayPartner";
import { apiResponse, requireAdmin, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

export const PUT = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const { orderedPartnerIds } = await req.json();

  const arrayError = validators.array(orderedPartnerIds, "orderedPartnerIds");
  if (arrayError) {
    return apiResponse.badRequest(arrayError);
  }
  if (!orderedPartnerIds || orderedPartnerIds.length === 0) {
    return apiResponse.badRequest("orderedPartnerIds must be a non-empty array");
  }

  await updateDisplayPartnerOrder(db, orderedPartnerIds);

  logger.logUserAction("update_partner_order", { count: orderedPartnerIds.length });
  return apiResponse.success({ success: true });
});
