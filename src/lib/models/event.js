import { ObjectId } from "mongodb";
const EVENT_COLLECTION = "events";

export async function createEvent(db, event) {
  return await db.collection(EVENT_COLLECTION).insertOne({
    ...event,
    userId: event.userId,
    imageUrl: event.imageUrl,
    createdAt: new Date(),
  });
}

export async function getEvents(db, userId) {
  return await db
    .collection(EVENT_COLLECTION)
    .find({ userId })
    .sort({ date: 1 })
    .toArray();
}

export async function updateEvent(db, eventId, updates) {
  return await db
    .collection(EVENT_COLLECTION)
    .updateOne({ _id: new ObjectId(eventId) }, { $set: updates });
}

export async function deleteEvent(db, eventId) {
  return await db
    .collection(EVENT_COLLECTION)
    .deleteOne({ _id: new ObjectId(eventId) });
}
