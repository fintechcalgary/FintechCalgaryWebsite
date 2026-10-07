import { connectToDatabase } from "@/lib/mongodb";
import {
  createDocumentationDocument,
  getDocumentationDocumentsByFolder,
  validateDocumentationFile,
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

  const { folderId } = await params;
  const db = await connectToDatabase();
  const folder = await getDocumentationFolderById(db, folderId);
  if (!folder) return apiResponse.notFound("Folder not found");

  const documents = await getDocumentationDocumentsByFolder(db, folder._id);
  return apiResponse.success(documents);
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { session, error } = await requireAnyPermission([
    PERMISSIONS.DOCUMENTATION,
    PERMISSIONS.DOCUMENTATION_FINANCE,
    PERMISSIONS.DOCUMENTATION_MANAGE,
  ]);
  if (error) return error;

  const { folderId } = await params;
  const db = await connectToDatabase();
  const folder = await getDocumentationFolderById(db, folderId);
  if (!folder) return apiResponse.notFound("Folder not found");

  if (!canManageDocumentationFolder(session.user.role, folder.slug)) {
    return apiResponse.forbidden(
      "You do not have permission to upload to this folder",
    );
  }

  const formData = await req.formData();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const file = formData.get("file");

  if (!title) return apiResponse.badRequest("Title is required");

  const fileError = validateDocumentationFile(file);
  if (fileError) return apiResponse.badRequest(fileError);

  const document = await createDocumentationDocument(db, {
    folderId: folder._id,
    title,
    description,
    file,
    uploadedBy: session.user.username || session.user.email,
  });

  return apiResponse.success(document, 201);
});
