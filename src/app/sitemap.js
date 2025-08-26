import { connectToDatabase } from "@/lib/mongodb";

export default async function sitemap() {
  let eventUrls = [];

  try {
    // Connect to database directly during build time
    const db = await connectToDatabase();
    const events = await db.collection("events").find({}).toArray();

    eventUrls = events.map((event) => ({
      url: `https://fintechcalgary.ca/events/${event._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.warn("Could not fetch events for sitemap:", error.message);
    // Continue with static routes even if events fail
  }

  // Static routes
  const routes = [
    "",
    "/about",
    "/events",
    "/executives",
    "/partners",
    "/contact",
    "/join",
  ].map((route) => ({
    url: `https://fintechcalgary.ca${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  return [...routes, ...eventUrls];
}
