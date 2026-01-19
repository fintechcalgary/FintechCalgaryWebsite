const MEMBER_COLLECTION = "members";

/**
 * Retrieve all members from the members collection
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

