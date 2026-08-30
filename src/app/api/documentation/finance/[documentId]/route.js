import { connectToDatabase } from "@/lib/mongodb";
import {
  deleteFinanceDocument,
  getFinanceDocumentById,
  getFinanceDocumentFileBuffer,
} from "@/lib/models/financeDocument";
import { apiResponse, requireAnyPermission, withErrorHandler } from "@/lib/api-helpers";
import { PERMISSIONS } from "@/lib/permissions";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandler(async (_req, { params }) => {
  const { error } = await requireAnyPermission([
    PERMISSIONS.DOCUMENTATION,
    PERMISSIONS.DOCUMENTATION_FINANCE,
  ]);
  if (error) return error;

  const db = await connectToDatabase();
  const doc = await db.collection("financeDocuments").findOne({
    _id: new ObjectId(params.documentId),
  });

  if (!doc) return apiResponse.notFound("Document not found");

  const buffer = getFinanceDocumentFileBuffer(doc);
  if (!buffer) return apiResponse.notFound("File not found");

  return new Response(buffer, {
    headers: {
      "Content-Type": doc.file.mimeType,
      "Content-Disposition": `attachment; filename="${doc.file.filename}"`,
    },
  });
});

export const DELETE = withErrorHandler(async (_req, { params }) => {
  const { error } = await requireAnyPermission([
    PERMISSIONS.DOCUMENTATION_FINANCE,
  ]);
  if (error) return error;

  const db = await connectToDatabase();
  const existing = await getFinanceDocumentById(db, params.documentId);
  if (!existing) return apiResponse.notFound("Document not found");

  await deleteFinanceDocument(db, params.documentId);
  return apiResponse.success({ deleted: true });
});
