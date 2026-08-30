import { Binary, ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/constants";

export async function buildFinanceDocumentFile(file) {
  const bytes = await file.arrayBuffer();
  return {
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    data: new Binary(Buffer.from(bytes)),
    uploadedAt: new Date(),
  };
}

export async function getFinanceDocuments(db) {
  const docs = await db
    .collection(COLLECTIONS.FINANCE_DOCUMENTS)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(serializeFinanceDocument);
}

export async function getFinanceDocumentById(db, id) {
  const doc = await db.collection(COLLECTIONS.FINANCE_DOCUMENTS).findOne({
    _id: new ObjectId(id),
  });
  return doc ? serializeFinanceDocument(doc) : null;
}

export async function createFinanceDocument(db, { title, description, file, uploadedBy }) {
  const now = new Date();
  const fileData = await buildFinanceDocumentFile(file);
  const result = await db.collection(COLLECTIONS.FINANCE_DOCUMENTS).insertOne({
    title,
    description: description || "",
    section: "finance",
    file: fileData,
    uploadedBy,
    createdAt: now,
    updatedAt: now,
  });

  return getFinanceDocumentById(db, result.insertedId.toString());
}

export async function deleteFinanceDocument(db, id) {
  const result = await db.collection(COLLECTIONS.FINANCE_DOCUMENTS).deleteOne({
    _id: new ObjectId(id),
  });
  return result.deletedCount > 0;
}

export function serializeFinanceDocument(doc) {
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    section: doc.section,
    uploadedBy: doc.uploadedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    file: doc.file
      ? {
          filename: doc.file.filename,
          mimeType: doc.file.mimeType,
          size: doc.file.size,
          uploadedAt: doc.file.uploadedAt,
        }
      : null,
  };
}

export function getFinanceDocumentFileBuffer(doc) {
  if (!doc?.file?.data) return null;
  return Buffer.from(doc.file.data.buffer);
}
