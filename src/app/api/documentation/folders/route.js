import { connectToDatabase } from "@/lib/mongodb";
import {
  createDocumentationFolder,
  getDocumentationFolders,
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

export const GET = withErrorHandler(async () => {
  const { error } = await requireAnyPermission([
    PERMISSIONS.DOCUMENTATION,
    PERMISSIONS.DOCUMENTATION_FINANCE,
  ]);
  if (error) return error;

  const db = await connectToDatabase();
  const folders = await getDocumentationFolders(db);
  return apiResponse.success(folders);
});

export const POST = withErrorHandler(async (req) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const name = body.name?.toString().trim();
  const description = body.description?.toString().trim() || "";

  if (!name) return apiResponse.badRequest("Folder name is required");

  const db = await connectToDatabase();
  try {
    const folder = await createDocumentationFolder(db, {
      name,
      description,
      createdBy: session.user.username || session.user.email,
    });
    return apiResponse.success(folder, 201);
  } catch (err) {
    return apiResponse.badRequest(err.message || "Failed to create folder");
  }
});
