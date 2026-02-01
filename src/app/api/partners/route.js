import { connectToDatabase } from "@/lib/mongodb";
import {
  getDisplayPartners,
  createDisplayPartner,
} from "@/lib/models/displayPartner";
import {
  apiResponse,
  requireAdmin,
  validators,
  withErrorHandler,
} from "@/lib/api-helpers";

export const GET = withErrorHandler(async () => {
  const db = await connectToDatabase();
  const partners = await getDisplayPartners(db);
  return apiResponse.success(partners);
});

export const POST = withErrorHandler(async (req) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const body = await req.json();

  const requiredFields = ["name"];
  const validationError = validators.requiredFields(body, requiredFields);
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  const partner = {
    name: body.name,
    description: body.description || "",
    website: body.website || "",
    color: body.color || "#8b5cf6",
    logo: body.logo || null,
    order: body.order,
  };

  const created = await createDisplayPartner(db, partner);
  return apiResponse.success(created, 201);
});
