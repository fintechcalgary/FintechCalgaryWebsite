import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
const MEMBER_COLLECTION = "members";

export async function createMember(db, member) {
  const hashedPassword = await bcrypt.hash(member.password, 10);

  return await db.collection(MEMBER_COLLECTION).insertOne({
    ...member,
    password: hashedPassword,
    createdAt: new Date(),
    role: "member",
  });
}

export async function getMembers(db) {
  return await db
    .collection(MEMBER_COLLECTION)
    .find({})
    .sort({ name: 1 })
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
