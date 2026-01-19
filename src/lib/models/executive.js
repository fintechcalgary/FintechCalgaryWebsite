import { ObjectId } from "mongodb";
const EXECUTIVE_COLLECTION = "executives";

export async function createExecutive(db, executive) {
  const executiveCount = await db.collection(EXECUTIVE_COLLECTION).countDocuments();

  return await db.collection(EXECUTIVE_COLLECTION).insertOne({
    ...executive,
    createdAt: new Date(),
    role: "member",
    order: executiveCount + 1,
  });
}

export async function getExecutives(db) {
  return await db
    .collection(EXECUTIVE_COLLECTION)
    .find({})
    .sort({ order: 1 })
    .toArray();
}

export async function updateExecutive(db, executiveId, updates) {
  return await db
    .collection(EXECUTIVE_COLLECTION)
    .updateOne({ _id: new ObjectId(executiveId) }, { $set: updates });
}

export async function deleteExecutive(db, executiveId) {
  return await db
    .collection(EXECUTIVE_COLLECTION)
    .deleteOne({ _id: new ObjectId(executiveId) });
}

export async function updateExecutiveOrder(db, orderedExecutiveIds) {
  const bulkOperations = orderedExecutiveIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) }, // Convert id to ObjectId
      update: { $set: { order: index } },
    },
  }));

  // Execute bulk write to update all executives' order fields
  await db.collection("executives").bulkWrite(bulkOperations);
}

