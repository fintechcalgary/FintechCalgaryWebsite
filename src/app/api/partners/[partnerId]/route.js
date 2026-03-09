import { connectToDatabase } from "@/lib/mongodb";
import {
  getDisplayPartnerById,
  updateDisplayPartner,
  deleteDisplayPartner,
} from "@/lib/models/displayPartner";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req, context) {
  try {
    const { partnerId } = await context.params;
    const db = await connectToDatabase();
    const partner = await getDisplayPartnerById(db, partnerId);
    if (!partner) {
      return apiResponse.notFound("Partner not found");
    }
    return apiResponse.success(partner);
  } catch (error) {
    return apiResponse.error(error.message || "Internal server error", 500);
  }
}

export const PUT = withErrorHandler(async (req, context) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const { partnerId } = await context.params;
  const db = await connectToDatabase();
  const existing = await getDisplayPartnerById(db, partnerId);
  if (!existing) {
    return apiResponse.notFound("Partner not found");
  }

  const body = await req.json();
  const updates = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.website !== undefined) updates.website = body.website;
  if (body.color !== undefined) updates.color = body.color;
  if (body.logo !== undefined) updates.logo = body.logo;
  if (body.order !== undefined) updates.order = body.order;

  await updateDisplayPartner(db, partnerId, updates);
  const updated = await getDisplayPartnerById(db, partnerId);
  return apiResponse.success(updated);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const { partnerId } = await context.params;
  const db = await connectToDatabase();
  const existing = await getDisplayPartnerById(db, partnerId);
  if (!existing) {
    return apiResponse.notFound("Partner not found");
  }

  await deleteDisplayPartner(db, partnerId);
  return new Response(null, { status: 204 });
});
