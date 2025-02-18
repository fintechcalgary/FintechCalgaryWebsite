const SUBSCRIBER_COLLECTION = "subscribers";

/**
 * Create a new subscriber when a user clicks "Join"
 * @param {Object} db - Database connection
 * @param {Object} subscriber - Subscriber details (email, name)
 */
export async function createSubscriber(db, subscriber) {
  const existingSubscriber = await db
    .collection(SUBSCRIBER_COLLECTION)
    .findOne({ email: subscriber.email });

  if (existingSubscriber) {
    throw new Error("This email is already subscribed.");
  }

  return await db.collection(SUBSCRIBER_COLLECTION).insertOne({
    ...subscriber,
    createdAt: new Date(),
  });
}

/**
 * Retrieve all subscribers (for email lists)
 * @param {Object} db - Database connection
 * @returns {Array} - List of subscribers sorted by subscription date
 */
export async function getSubscribers(db) {
  return await db
    .collection(SUBSCRIBER_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}
