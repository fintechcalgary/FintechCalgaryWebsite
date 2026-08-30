import { connectToDatabase } from "@/lib/mongodb";
import {
  createMarketingApproval,
  getMarketingApprovals,
} from "@/lib/models/marketingApproval";
import { apiResponse, requireAnyPermission, withErrorHandler } from "@/lib/api-helpers";
import { FILE_TYPES } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function validateMarketingFile(file, label) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return `${label} file is required`;
  }
  if (
    file.type &&
    !FILE_TYPES.MARKETING.MIME_TYPES.includes(file.type) &&
    !FILE_TYPES.MARKETING.EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(`.${ext}`),
    )
  ) {
    return `${label} file type not allowed`;
  }
  if (file.size > FILE_TYPES.MARKETING.MAX_SIZE) {
    return `${label} file must be less than ${FILE_TYPES.MARKETING.MAX_SIZE / (1024 * 1024)}MB`;
  }
  return null;
}

export const GET = withErrorHandler(async (req) => {
  const { session, error } = await requireAnyPermission([
    PERMISSIONS.MARKETING_SUBMIT,
    PERMISSIONS.MARKETING_APPROVE,
  ]);
  if (error) return error;

  const db = await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  const filters = { status };
  if (
    session.user.role === "marketing" &&
    !searchParams.get("all")
  ) {
    filters.submittedBy =
      session.user.username || session.user.email;
  }

  const items = await getMarketingApprovals(db, filters);
  return apiResponse.success(items);
});

export const POST = withErrorHandler(async (req) => {
  const { session, error } = await requireAnyPermission([
    PERMISSIONS.MARKETING_SUBMIT,
  ]);
  if (error) return error;

  const formData = await req.formData();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const partnerName = formData.get("partnerName")?.toString().trim() || "";
  const contentFile = formData.get("contentFile");
  const proofFile = formData.get("proofFile");

  if (!title) return apiResponse.badRequest("Title is required");
  if (!partnerName) return apiResponse.badRequest("Partner name is required");

  const contentError = validateMarketingFile(contentFile, "Marketing content");
  if (contentError) return apiResponse.badRequest(contentError);

  const proofError = validateMarketingFile(
    proofFile,
    "Partner approval proof",
  );
  if (proofError) return apiResponse.badRequest(proofError);

  const db = await connectToDatabase();
  const item = await createMarketingApproval(db, {
    title,
    description,
    partnerName,
    contentFile,
    proofFile,
    submittedBy: session.user.username || session.user.email,
  });

  return apiResponse.success(item, 201);
});
