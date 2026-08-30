import { connectToDatabase } from "@/lib/mongodb";
import {
  createFinanceDocument,
  deleteFinanceDocument,
  getFinanceDocuments,
} from "@/lib/models/financeDocument";
import { apiResponse, requireAnyPermission, withErrorHandler } from "@/lib/api-helpers";
import { FILE_TYPES } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function validateFinanceFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return "A finance document file is required";
  }
  if (
    file.type &&
    !FILE_TYPES.FINANCE.MIME_TYPES.includes(file.type) &&
    !FILE_TYPES.FINANCE.EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(`.${ext}`),
    )
  ) {
    return `File type not allowed. Allowed: ${FILE_TYPES.FINANCE.EXTENSIONS.join(", ")}`;
  }
  if (file.size > FILE_TYPES.FINANCE.MAX_SIZE) {
    return `File must be less than ${FILE_TYPES.FINANCE.MAX_SIZE / (1024 * 1024)}MB`;
  }
  return null;
}

export const GET = withErrorHandler(async () => {
  const { error } = await requireAnyPermission([
    PERMISSIONS.DOCUMENTATION,
    PERMISSIONS.DOCUMENTATION_FINANCE,
  ]);
  if (error) return error;

  const db = await connectToDatabase();
  const documents = await getFinanceDocuments(db);
  return apiResponse.success(documents);
});

export const POST = withErrorHandler(async (req) => {
  const { session, error } = await requireAnyPermission([
    PERMISSIONS.DOCUMENTATION_FINANCE,
  ]);
  if (error) return error;

  const formData = await req.formData();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const file = formData.get("file");

  if (!title) return apiResponse.badRequest("Title is required");

  const fileError = validateFinanceFile(file);
  if (fileError) return apiResponse.badRequest(fileError);

  const db = await connectToDatabase();
  const document = await createFinanceDocument(db, {
    title,
    description,
    file,
    uploadedBy: session.user.username || session.user.email,
  });

  return apiResponse.success(document, 201);
});
