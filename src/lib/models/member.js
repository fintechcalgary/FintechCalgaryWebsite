const MEMBER_COLLECTION = "generalMembers";

/**
 * Retrieve all members from the generalMembers collection
 * @param {Object} db - Database connection
 * @returns {Array} - List of members sorted by creation date
 */
export async function getMembers(db) {
  return await db
    .collection(MEMBER_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

