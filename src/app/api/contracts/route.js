import { connectToDatabase } from "@/lib/mongodb";
import { createContract, getContracts, buildEoiPdf } from "@/lib/models/contract";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";
import { FILE_TYPES } from "@/lib/constants";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function validatePdfFile(file) {
  if (!FILE_TYPES.PDF.MIME_TYPES.includes(file.type)) {
    return "EOI file must be a PDF";
  }
  if (file.size === 0) {
    return "EOI file is empty";
  }
  if (file.size > FILE_TYPES.PDF.MAX_SIZE) {
    return `EOI file must be less than ${FILE_TYPES.PDF.MAX_SIZE / (1024 * 1024)}MB`;
  }
  return null;
}

export const GET = withErrorHandler(async () => {
  const { error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const contracts = await getContracts(db);

  return apiResponse.success(contracts);
});

export const POST = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData();
  const title = formData.get("title")?.toString().trim();
  const partnerName = formData.get("partnerName")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const file = formData.get("eoiPdf");

  if (!title) return apiResponse.badRequest("Title is required");
  if (!partnerName) return apiResponse.badRequest("Partner name is required");

  const uploadedBy = session.user.username || session.user.email;
  let eoiPdf = null;

  if (file && typeof file === "object" && typeof file.arrayBuffer === "function") {
    const validationError = validatePdfFile(file);
    if (validationError) return apiResponse.badRequest(validationError);

    const buffer = Buffer.from(await file.arrayBuffer());
    eoiPdf = buildEoiPdf({
      buffer,
      filename: file.name || "eoi.pdf",
      contentType: file.type,
      size: file.size,
      uploadedBy,
    });
  }

  const db = await connectToDatabase();

  logger.logUserAction("create_contract", { contractTitle: title });
  const result = await createContract(db, {
    title,
    partnerName,
    description,
    eoiPdf,
    createdBy: uploadedBy,
  });

  return apiResponse.success({ insertedId: result.insertedId }, 201);
});
