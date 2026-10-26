import { ObjectId } from "mongodb";
import {
  COLLECTIONS,
  DEFAULT_DOCUMENTATION_FOLDERS,
  DOCUMENTATION_SECTIONS,
} from "@/lib/constants";

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function serializeDocumentationFolder(folder, documentCount = 0) {
  if (!folder) return null;
  return {
    _id: folder._id.toString(),
    name: folder.name,
    slug: folder.slug,
    description: folder.description || "",
    protected: Boolean(folder.protected),
    createdBy: folder.createdBy || null,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
    documentCount,
  };
}

async function migrateLegacyFinanceDocuments(db) {
  const financeFolder = await db
    .collection(COLLECTIONS.DOCUMENTATION_FOLDERS)
    .findOne({ slug: DOCUMENTATION_SECTIONS.FINANCE });
  if (!financeFolder) return;

  const docsCollection = db.collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS);
  const existingCount = await docsCollection.countDocuments({
    folderId: financeFolder._id,
  });
  if (existingCount > 0) return;

  const legacy = await db
    .collection(COLLECTIONS.FINANCE_DOCUMENTS)
    .find({})
    .toArray();
  if (legacy.length === 0) return;

  const now = new Date();
  const inserts = legacy.map((doc) => ({
    folderId: financeFolder._id,
    title: doc.title,
    description: doc.description || "",
    file: doc.file,
    uploadedBy: doc.uploadedBy,
    createdAt: doc.createdAt || now,
    updatedAt: doc.updatedAt || now,
    migratedFrom: "financeDocuments",
    legacyId: doc._id,
  }));

  if (inserts.length > 0) {
    await docsCollection.insertMany(inserts);
  }
}

export async function ensureDefaultFolders(db) {
  const collection = db.collection(COLLECTIONS.DOCUMENTATION_FOLDERS);
  const now = new Date();

  for (const defaults of DEFAULT_DOCUMENTATION_FOLDERS) {
    await collection.updateOne(
      { slug: defaults.slug },
      {
        $setOnInsert: {
          name: defaults.name,
          slug: defaults.slug,
          description: defaults.description,
          protected: defaults.protected,
          createdBy: "system",
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
  }

  await migrateLegacyFinanceDocuments(db);
}

export async function getDocumentationFolders(db) {
  await ensureDefaultFolders(db);

  const folders = await db
    .collection(COLLECTIONS.DOCUMENTATION_FOLDERS)
    .find({})
    .sort({ name: 1 })
    .toArray();

  const counts = await db
    .collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS)
    .aggregate([{ $group: { _id: "$folderId", count: { $sum: 1 } } }])
    .toArray();

  const countMap = new Map(
    counts.map((row) => [row._id.toString(), row.count]),
  );

  return folders.map((folder) =>
    serializeDocumentationFolder(
      folder,
      countMap.get(folder._id.toString()) || 0,
    ),
  );
}

export async function getDocumentationFolderById(db, id) {
  if (!ObjectId.isValid(id)) return null;
  await ensureDefaultFolders(db);

  const folder = await db.collection(COLLECTIONS.DOCUMENTATION_FOLDERS).findOne({
    _id: new ObjectId(id),
  });
  if (!folder) return null;

  const documentCount = await db
    .collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS)
    .countDocuments({ folderId: folder._id });

  return serializeDocumentationFolder(folder, documentCount);
}

export async function getDocumentationFolderBySlug(db, slug) {
  await ensureDefaultFolders(db);
  const folder = await db.collection(COLLECTIONS.DOCUMENTATION_FOLDERS).findOne({
    slug,
  });
  return folder ? serializeDocumentationFolder(folder) : null;
}

export async function createDocumentationFolder(
  db,
  { name, description, createdBy },
) {
  const trimmedName = name?.trim();
  if (!trimmedName) {
    throw new Error("Folder name is required");
  }

  let slug = slugify(trimmedName);
  if (!slug) {
    throw new Error("Folder name must contain letters or numbers");
  }

  const collection = db.collection(COLLECTIONS.DOCUMENTATION_FOLDERS);
  const existing = await collection.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const now = new Date();
  const result = await collection.insertOne({
    name: trimmedName,
    slug,
    description: description?.trim() || "",
    protected: false,
    createdBy,
    createdAt: now,
    updatedAt: now,
  });

  return getDocumentationFolderById(db, result.insertedId.toString());
}

export async function deleteDocumentationFolder(db, id) {
  if (!ObjectId.isValid(id)) return { deleted: false, reason: "invalid" };

  const collection = db.collection(COLLECTIONS.DOCUMENTATION_FOLDERS);
  const folder = await collection.findOne({ _id: new ObjectId(id) });
  if (!folder) return { deleted: false, reason: "not_found" };
  if (folder.protected) return { deleted: false, reason: "protected" };

  await db.collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS).deleteMany({
    folderId: folder._id,
  });
  await collection.deleteOne({ _id: folder._id });
  return { deleted: true };
}
