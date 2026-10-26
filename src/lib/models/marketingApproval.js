import { Binary, ObjectId } from "mongodb";
import { COLLECTIONS, MARKETING_APPROVAL_STATUS } from "@/lib/constants";

async function buildAttachment(file, fieldName) {
  if (!file || typeof file.arrayBuffer !== "function") return null;
  const bytes = await file.arrayBuffer();
  return {
    fieldName,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    data: new Binary(Buffer.from(bytes)),
    uploadedAt: new Date(),
  };
}

export async function getMarketingApprovals(db, { status, submittedBy } = {}) {
  const query = {};
  if (status) query.status = status;
  if (submittedBy) query.submittedBy = submittedBy;

  const items = await db
    .collection(COLLECTIONS.MARKETING_APPROVALS)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return items.map(serializeMarketingApproval);
}

export async function getMarketingApprovalById(db, id) {
  const item = await db.collection(COLLECTIONS.MARKETING_APPROVALS).findOne({
    _id: new ObjectId(id),
  });
  return item ? serializeMarketingApproval(item) : null;
}

export async function createMarketingApproval(
  db,
  { title, description, partnerName, contentFile, proofFile, submittedBy },
) {
  const now = new Date();
  const result = await db.collection(COLLECTIONS.MARKETING_APPROVALS).insertOne({
    title,
    description: description || "",
    partnerName: partnerName || "",
    status: MARKETING_APPROVAL_STATUS.PENDING,
    contentFile: await buildAttachment(contentFile, "content"),
    proofFile: await buildAttachment(proofFile, "proof"),
    submittedBy,
    reviewedBy: null,
    reviewNote: "",
    reviewedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return getMarketingApprovalById(db, result.insertedId.toString());
}

export async function reviewMarketingApproval(
  db,
  id,
  { status, reviewNote, reviewedBy },
) {
  const now = new Date();
  await db.collection(COLLECTIONS.MARKETING_APPROVALS).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        reviewNote: reviewNote || "",
        reviewedBy,
        reviewedAt: now,
        updatedAt: now,
      },
    },
  );

  return getMarketingApprovalById(db, id);
}

export async function deleteMarketingApproval(db, id) {
  const result = await db.collection(COLLECTIONS.MARKETING_APPROVALS).deleteOne({
    _id: new ObjectId(id),
  });
  return result.deletedCount > 0;
}

export function serializeMarketingApproval(item) {
  if (!item) return null;

  const serializeFile = (file) =>
    file
      ? {
          filename: file.filename,
          mimeType: file.mimeType,
          size: file.size,
          uploadedAt: file.uploadedAt,
        }
      : null;

  return {
    _id: item._id.toString(),
    title: item.title,
    description: item.description,
    partnerName: item.partnerName,
    status: item.status,
    submittedBy: item.submittedBy,
    reviewedBy: item.reviewedBy,
    reviewNote: item.reviewNote,
    reviewedAt: item.reviewedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    contentFile: serializeFile(item.contentFile),
    proofFile: serializeFile(item.proofFile),
  };
}

export function getMarketingApprovalFile(item, type) {
  const file = type === "content" ? item?.contentFile : item?.proofFile;
  if (!file?.data) return null;
  return {
    buffer: Buffer.from(file.data.buffer),
    filename: file.filename,
    mimeType: file.mimeType,
  };
}
