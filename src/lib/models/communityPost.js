import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/constants";
import { COMMUNITY_POST_FIELDS } from "@/lib/communityPosts";

const COLLECTION = COLLECTIONS.COMMUNITY_POSTS;

export function isValidObjectId(id) {
  return Boolean(id) && ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

export async function createCommunityPost(db, post) {
  const now = new Date();
  const doc = {
    title: post.title,
    description: post.description,
    eventDate: post.eventDate || "",
    eventTime: post.eventTime || "",
    organizationName: post.organizationName || "",
    location: post.location || "",
    bannerUrl: post.bannerUrl || "",
    registrationUrl: post.registrationUrl || "",
    createdById: post.createdById,
    createdByName: post.createdByName || "",
    createdByRole: post.createdByRole || "",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function getCommunityPosts(db) {
  return db
    .collection(COLLECTION)
    .find({})
    .sort({ eventDate: 1, createdAt: -1 })
    .toArray();
}

export async function getCommunityPostById(db, postId) {
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(postId) });
}

export async function updateCommunityPost(db, postId, updates) {
  const $set = { updatedAt: new Date() };
  for (const key of COMMUNITY_POST_FIELDS) {
    if (updates[key] !== undefined) $set[key] = updates[key];
  }

  return db
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(postId) }, { $set });
}

export async function deleteCommunityPost(db, postId) {
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(postId) });
}
