import { Binary, ObjectId } from "mongodb";
import { COLLECTIONS, FILE_TYPES } from "@/lib/constants";

export async function buildDocumentationDocumentFile(file) {
  const bytes = await file.arrayBuffer();
  return {
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    data: new Binary(Buffer.from(bytes)),
    uploadedAt: new Date(),
  };
}

export function serializeDocumentationDocument(doc) {
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    folderId: doc.folderId?.toString?.() || doc.folderId,
    title: doc.title,
    description: doc.description || "",
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

export function getDocumentationDocumentFileBuffer(doc) {
  if (!doc?.file?.data) return null;
  return Buffer.from(doc.file.data.buffer);
}

export function validateDocumentationFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return "A document file is required";
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

export async function getDocumentationDocumentsByFolder(db, folderId) {
  if (!ObjectId.isValid(folderId)) return [];

  const docs = await db
    .collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS)
    .find({ folderId: new ObjectId(folderId) })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(serializeDocumentationDocument);
}

export async function getDocumentationDocumentById(db, id) {
  if (!ObjectId.isValid(id)) return null;
  const doc = await db.collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS).findOne({
    _id: new ObjectId(id),
  });
  return doc ? serializeDocumentationDocument(doc) : null;
}

export async function getDocumentationDocumentRawById(db, id) {
  if (!ObjectId.isValid(id)) return null;
  return db.collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS).findOne({
    _id: new ObjectId(id),
  });
}

export async function createDocumentationDocument(
  db,
  { folderId, title, description, file, uploadedBy },
) {
  if (!ObjectId.isValid(folderId)) {
    throw new Error("Invalid folder");
  }

  const folder = await db.collection(COLLECTIONS.DOCUMENTATION_FOLDERS).findOne({
    _id: new ObjectId(folderId),
  });
  if (!folder) {
    throw new Error("Folder not found");
  }

  const now = new Date();
  const fileData = await buildDocumentationDocumentFile(file);
  const result = await db.collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS).insertOne({
    folderId: folder._id,
    title,
    description: description || "",
    file: fileData,
    uploadedBy,
    createdAt: now,
    updatedAt: now,
  });

  return getDocumentationDocumentById(db, result.insertedId.toString());
}

export async function deleteDocumentationDocument(db, id) {
  if (!ObjectId.isValid(id)) return false;
  const result = await db.collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS).deleteOne({
    _id: new ObjectId(id),
  });
  return result.deletedCount > 0;
}
