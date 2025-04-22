export default async function sitemap() {
  // Get all dynamic routes like events
  const events = await fetch("https://fintechcalgary.ca/api/events").then(
    (res) => res.json()
  );

  const eventUrls = events.map((event) => ({
    url: `https://fintechcalgary.ca/events/${event._id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

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
