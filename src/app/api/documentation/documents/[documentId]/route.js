import { connectToDatabase } from "@/lib/mongodb";
import {
  deleteDocumentationDocument,
  getDocumentationDocumentFileBuffer,
  getDocumentationDocumentRawById,
} from "@/lib/models/documentationDocument";
import { getDocumentationFolderById } from "@/lib/models/documentationFolder";
import {
  apiResponse,
  requireAnyPermission,
  withErrorHandler,
} from "@/lib/api-helpers";
import {
  canManageDocumentationFolder,
  PERMISSIONS,
} from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandler(async (_req, { params }) => {
  const { error } = await requireAnyPermission([
    PERMISSIONS.DOCUMENTATION,
    PERMISSIONS.DOCUMENTATION_FINANCE,
  ]);
  if (error) return error;

  const { documentId } = await params;
  const db = await connectToDatabase();
  const doc = await getDocumentationDocumentRawById(db, documentId);
  if (!doc) return apiResponse.notFound("Document not found");

  const buffer = getDocumentationDocumentFileBuffer(doc);
  if (!buffer) return apiResponse.notFound("File not found");

  return new Response(buffer, {
    headers: {
      "Content-Type": doc.file.mimeType,
      "Content-Disposition": `attachment; filename="${doc.file.filename}"`,
    },
  });
});

export const DELETE = withErrorHandler(async (_req, { params }) => {
  const { session, error } = await requireAnyPermission([
    PERMISSIONS.DOCUMENTATION,
    PERMISSIONS.DOCUMENTATION_FINANCE,
    PERMISSIONS.DOCUMENTATION_MANAGE,
  ]);
  if (error) return error;

  const { documentId } = await params;
  const db = await connectToDatabase();
  const doc = await getDocumentationDocumentRawById(db, documentId);
  if (!doc) return apiResponse.notFound("Document not found");

  const folder = await getDocumentationFolderById(
    db,
    doc.folderId.toString(),
  );
  if (!folder) return apiResponse.notFound("Folder not found");

  if (!canManageDocumentationFolder(session.user.role, folder.slug)) {
    return apiResponse.forbidden(
      "You do not have permission to delete documents in this folder",
    );
  }

  await deleteDocumentationDocument(db, documentId);
  return apiResponse.success({ deleted: true });
});
