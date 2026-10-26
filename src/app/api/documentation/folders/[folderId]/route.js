import { connectToDatabase } from "@/lib/mongodb";
import {
  deleteDocumentationFolder,
  getDocumentationFolderById,
} from "@/lib/models/documentationFolder";
import {
  apiResponse,
  requireAdmin,
  requireAnyPermission,
  withErrorHandler,
} from "@/lib/api-helpers";
import { PERMISSIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandler(async (_req, { params }) => {
  const { error } = await requireAnyPermission([
    PERMISSIONS.DOCUMENTATION,
    PERMISSIONS.DOCUMENTATION_FINANCE,
  ]);
  if (error) return error;

  const { folderId } = await params;
  const db = await connectToDatabase();
  const folder = await getDocumentationFolderById(db, folderId);
  if (!folder) return apiResponse.notFound("Folder not found");
  return apiResponse.success(folder);
});

export const DELETE = withErrorHandler(async (_req, { params }) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const { folderId } = await params;
  const db = await connectToDatabase();
  const result = await deleteDocumentationFolder(db, folderId);

  if (result.reason === "not_found" || result.reason === "invalid") {
    return apiResponse.notFound("Folder not found");
  }
  if (result.reason === "protected") {
    return apiResponse.badRequest(
      "Default folders cannot be deleted. You can still add or remove documents inside them.",
    );
  }

  return apiResponse.success({ deleted: true });
});
