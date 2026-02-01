import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/constants";
const MEMBER_COLLECTION = COLLECTIONS.PARTNER_APPLICATIONS;

export async function createPartner(db, member) {
  return await db.collection(MEMBER_COLLECTION).insertOne({
    ...member,
    createdAt: new Date(),
  });
}

export async function getPartners(db) {
  return await db.collection(MEMBER_COLLECTION).find({}).toArray();
}

export async function updatePartner(db, memberId, updates) {
  return await db
    .collection(MEMBER_COLLECTION)
    .updateOne({ _id: new ObjectId(memberId) }, { $set: updates });
}

export async function deletePartner(db, memberId) {
  return await db
    .collection(MEMBER_COLLECTION)
    .deleteOne({ _id: new ObjectId(memberId) });
}

