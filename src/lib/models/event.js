import { ObjectId } from "mongodb";
const EVENT_COLLECTION = "events";

export async function createEvent(db, event) {
  return await db.collection(EVENT_COLLECTION).insertOne({
    ...event,
    userId: event.userId,
    images: event.images || [], // Array of image URLs
    imageUrl: event.imageUrl, // Keep for backward compatibility
    createdAt: new Date(),
    time: event.time, // Time represented by a string
    registrations: [],
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

export async function registerForEvent(db, eventId, registrationData) {
  return await db.collection(EVENT_COLLECTION).updateOne(
    { _id: new ObjectId(eventId) },
    {
      $addToSet: {
        registrations: registrationData,
      },
    }
  );
}

export async function isUserRegistered(db, eventId, userEmail) {
  const event = await db.collection(EVENT_COLLECTION).findOne({
    _id: new ObjectId(eventId),
    "registrations.userEmail": userEmail,
  });
  return !!event;
}
