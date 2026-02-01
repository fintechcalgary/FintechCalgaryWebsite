import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/constants";

const PARTNERS_COLLECTION = COLLECTIONS.PARTNERS;

export async function getDisplayPartners(db) {
  return await db
    .collection(PARTNERS_COLLECTION)
    .find({})
    .sort({ order: 1, name: 1 })
    .toArray();
}

export async function getDisplayPartnerById(db, partnerId) {
  return await db.collection(PARTNERS_COLLECTION).findOne({
    _id: new ObjectId(partnerId),
  });
}

export async function createDisplayPartner(db, partner) {
  const count = await db.collection(PARTNERS_COLLECTION).countDocuments();
  const doc = {
    ...partner,
    order: partner.order ?? count,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection(PARTNERS_COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function updateDisplayPartner(db, partnerId, updates) {
  const result = await db.collection(PARTNERS_COLLECTION).updateOne(
    { _id: new ObjectId(partnerId) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return result;
}

export async function deleteDisplayPartner(db, partnerId) {
  return await db.collection(PARTNERS_COLLECTION).deleteOne({
    _id: new ObjectId(partnerId),
  });
}

export async function updateDisplayPartnerOrder(db, orderedPartnerIds) {
  const bulkOperations = orderedPartnerIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) },
      update: { $set: { order: index, updatedAt: new Date() } },
    },
  }));
  if (bulkOperations.length === 0) return;
  await db.collection(PARTNERS_COLLECTION).bulkWrite(bulkOperations);
}
