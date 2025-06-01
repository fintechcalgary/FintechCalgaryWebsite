import { ObjectId } from "mongodb";
const MEMBER_COLLECTION = "associateMembers";

export async function createAssociateMember(db, member) {
  return await db.collection(MEMBER_COLLECTION).insertOne({
    ...member,
    createdAt: new Date(),
  });
}

export async function getAssociateMembers(db) {
  return await db.collection(MEMBER_COLLECTION).find({}).toArray();
}

export async function updateAssociateMember(db, memberId, updates) {
  return await db
    .collection(MEMBER_COLLECTION)
    .updateOne({ _id: new ObjectId(memberId) }, { $set: updates });
}

export async function deleteAssociateMember(db, memberId) {
  return await db
    .collection(MEMBER_COLLECTION)
    .deleteOne({ _id: new ObjectId(memberId) });
}
