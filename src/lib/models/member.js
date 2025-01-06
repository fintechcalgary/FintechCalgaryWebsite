import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
const MEMBER_COLLECTION = "members";

export async function createMember(db, member) {
  const hashedPassword = await bcrypt.hash(member.password, 10);
  const memberCount = await db.collection(MEMBER_COLLECTION).countDocuments();

  return await db.collection(MEMBER_COLLECTION).insertOne({
    ...member,
    password: hashedPassword,
    createdAt: new Date(),
    role: "member",
    order: memberCount + 1,
  });
}

export async function getMembers(db) {
  return await db
    .collection(MEMBER_COLLECTION)
    .find({})
    .sort({ order: 1 })
    .toArray();
}

export async function updateMember(db, memberId, updates) {
  return await db
    .collection(MEMBER_COLLECTION)
    .updateOne({ _id: new ObjectId(memberId) }, { $set: updates });
}

export async function deleteMember(db, memberId) {
  return await db
    .collection(MEMBER_COLLECTION)
    .deleteOne({ _id: new ObjectId(memberId) });
}

export async function updateMemberOrder(db, orderedMemberIds) {
  const bulkOperations = orderedMemberIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) }, // Convert id to ObjectId
      update: { $set: { order: index } },
    },
  }));

  // Execute bulk write to update all members' order fields
  await db.collection("members").bulkWrite(bulkOperations);
}
