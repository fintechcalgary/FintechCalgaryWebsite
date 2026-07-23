import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import {
  getContract,
  getEoiPdf,
  setEoiPdf,
  buildEoiPdf,
} from "@/lib/models/contract";
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

// Streams the stored PDF. This authenticated route is the only way to view
// the EOI file, so access is limited to logged-in admins.
export const GET = withErrorHandler(async (req, context) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const { contractId } = await context.params;
  if (!ObjectId.isValid(contractId)) {
    return apiResponse.badRequest("Invalid contract id");
  }

  const db = await connectToDatabase();
  const pdf = await getEoiPdf(db, contractId);

  if (!pdf?.data) {
    return apiResponse.notFound("No EOI PDF attached to this contract");
  }

  const raw = pdf.data;
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw.buffer ?? raw);
  const filename = (pdf.filename || "eoi.pdf").replace(/["\\\r\n]/g, "");

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": pdf.contentType || "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
});

export const PUT = withErrorHandler(async (req, context) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { contractId } = await context.params;
  if (!ObjectId.isValid(contractId)) {
    return apiResponse.badRequest("Invalid contract id");
  }

  const formData = await req.formData();
  const file = formData.get("eoiPdf");

  if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
    return apiResponse.badRequest("No EOI PDF file provided");
  }

  const validationError = validatePdfFile(file);
  if (validationError) return apiResponse.badRequest(validationError);

  const db = await connectToDatabase();
  const contract = await getContract(db, contractId);
  if (!contract) {
    return apiResponse.notFound("Contract not found");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const eoiPdf = buildEoiPdf({
    buffer,
    filename: file.name || "eoi.pdf",
    contentType: file.type,
    size: file.size,
    uploadedBy: session.user.username || session.user.email,
  });

  logger.logUserAction("upload_contract_eoi", { contractId });
  await setEoiPdf(db, contractId, eoiPdf);

  const updated = await getContract(db, contractId);
  return apiResponse.success(updated);
});
