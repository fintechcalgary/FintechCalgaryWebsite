import { connectToDatabase } from "@/lib/mongodb";
import {
  getMarketingApprovalById,
  getMarketingApprovalFile,
  reviewMarketingApproval,
} from "@/lib/models/marketingApproval";
import { apiResponse, requireAnyPermission, withErrorHandler } from "@/lib/api-helpers";
import { MARKETING_APPROVAL_STATUS } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandler(async (_req, { params }) => {
  const { error } = await requireAnyPermission([
    PERMISSIONS.MARKETING_SUBMIT,
    PERMISSIONS.MARKETING_APPROVE,
  ]);
  if (error) return error;

  const { searchParams } = new URL(_req.url);
  const fileType = searchParams.get("file");

  const db = await connectToDatabase();
  const item = await db.collection("marketingApprovals").findOne({
    _id: new ObjectId(params.approvalId),
  });

  if (!item) return apiResponse.notFound("Submission not found");

  if (fileType === "content" || fileType === "proof") {
    const file = getMarketingApprovalFile(item, fileType);
    if (!file) return apiResponse.notFound("File not found");

    return new Response(file.buffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
      },
    });
  }

  return apiResponse.success(await getMarketingApprovalById(db, params.approvalId));
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { session, error } = await requireAnyPermission([
    PERMISSIONS.MARKETING_APPROVE,
  ]);
  if (error) return error;

  const body = await req.json();
  const { status, reviewNote } = body;

  if (
    !status ||
    ![MARKETING_APPROVAL_STATUS.APPROVED, MARKETING_APPROVAL_STATUS.REJECTED].includes(
      status,
    )
  ) {
    return apiResponse.badRequest("Status must be approved or rejected");
  }

  const db = await connectToDatabase();
  const existing = await getMarketingApprovalById(db, params.approvalId);
  if (!existing) return apiResponse.notFound("Submission not found");

  if (existing.status !== MARKETING_APPROVAL_STATUS.PENDING) {
    return apiResponse.badRequest("This submission has already been reviewed");
  }

  const updated = await reviewMarketingApproval(db, params.approvalId, {
    status,
    reviewNote,
    reviewedBy: session.user.username || session.user.email,
  });

  return apiResponse.success(updated);
});
