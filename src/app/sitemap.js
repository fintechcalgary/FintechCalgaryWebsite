import { connectToDatabase } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants";

export default async function sitemap() {
  let eventUrls = [];
  let communityUrls = [];

  try {
    const db = await connectToDatabase();
    const events = await db.collection(COLLECTIONS.EVENTS).find({}).toArray();

    eventUrls = events.map((event) => ({
      url: `https://fintechcalgary.ca/events/${event._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const posts = await db
      .collection(COLLECTIONS.COMMUNITY_POSTS)
      .find({})
      .toArray();

    communityUrls = posts.map((post) => ({
      url: `https://fintechcalgary.ca/community/${post._id}`,
      lastModified: post.updatedAt || post.createdAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.warn("Could not fetch sitemap entries:", error.message);
  }

  const routes = [
    "",
    "/about",
    "/events",
    "/community",
    "/executives",
    "/partners",
    "/contact",
    "/join",
    "/terms",
    "/privacy",
  ].map((route) => ({
    url: `https://fintechcalgary.ca${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  return [...routes, ...eventUrls, ...communityUrls];
}
