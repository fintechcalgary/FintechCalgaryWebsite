import {
  createDocumentationDocument,
  deleteDocumentationDocument,
  getDocumentationDocumentById,
  getDocumentationDocumentFileBuffer,
  getDocumentationDocumentRawById,
  getDocumentationDocumentsByFolder,
} from "@/lib/models/documentationDocument";
import {
  ensureDefaultFolders,
  getDocumentationFolderBySlug,
} from "@/lib/models/documentationFolder";
import { DOCUMENTATION_SECTIONS } from "@/lib/constants";

async function getFinanceFolder(db) {
  await ensureDefaultFolders(db);
  return getDocumentationFolderBySlug(db, DOCUMENTATION_SECTIONS.FINANCE);
}

export async function buildFinanceDocumentFile(file) {
  const { buildDocumentationDocumentFile } = await import(
    "@/lib/models/documentationDocument"
  );
  return buildDocumentationDocumentFile(file);
}

export function serializeFinanceDocument(doc) {
  if (!doc) return null;
  const id =
    typeof doc._id === "string" ? doc._id : doc._id?.toString?.() || doc._id;
  return {
    _id: id,
    title: doc.title,
    description: doc.description || "",
    section: doc.section || DOCUMENTATION_SECTIONS.FINANCE,
    folderId: doc.folderId?.toString?.() || doc.folderId || null,
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

export async function getFinanceDocuments(db) {
  const folder = await getFinanceFolder(db);
  if (!folder) return [];
  const docs = await getDocumentationDocumentsByFolder(db, folder._id);
  return docs.map((doc) =>
    serializeFinanceDocument({
      ...doc,
      section: DOCUMENTATION_SECTIONS.FINANCE,
    }),
  );
}

export async function getFinanceDocumentById(db, id) {
  const folder = await getFinanceFolder(db);
  if (!folder) return null;

  const doc = await getDocumentationDocumentById(db, id);
  if (!doc || doc.folderId !== folder._id) return null;

  return serializeFinanceDocument({
    ...doc,
    section: DOCUMENTATION_SECTIONS.FINANCE,
  });
}

export async function createFinanceDocument(
  db,
  { title, description, file, uploadedBy },
) {
  const folder = await getFinanceFolder(db);
  if (!folder) throw new Error("Finance folder not found");

  const created = await createDocumentationDocument(db, {
    folderId: folder._id,
    title,
    description,
    file,
    uploadedBy,
  });

  return serializeFinanceDocument({
    ...created,
    section: DOCUMENTATION_SECTIONS.FINANCE,
  });
}

export async function deleteFinanceDocument(db, id) {
  const existing = await getFinanceDocumentById(db, id);
  if (!existing) return false;
  return deleteDocumentationDocument(db, id);
}

export function getFinanceDocumentFileBuffer(doc) {
  return getDocumentationDocumentFileBuffer(doc);
}

export async function getFinanceDocumentRawById(db, id) {
  const folder = await getFinanceFolder(db);
  if (!folder) return null;

  const doc = await getDocumentationDocumentRawById(db, id);
  if (!doc || doc.folderId?.toString() !== folder._id) return null;
  return doc;
}
