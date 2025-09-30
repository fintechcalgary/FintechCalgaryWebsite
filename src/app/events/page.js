import { connectToDatabase } from "@/lib/mongodb";
import EventsPageClient from "./EventsPageClient";

// Server-side data fetching function
async function getEvents() {
  try {
    const db = await connectToDatabase();

    const events = await db
      .collection("events")
      .find({})
      .sort({ date: 1 })
      .toArray();

    // Convert MongoDB documents to plain objects and handle ObjectId
    const processedEvents = events.map((event) => ({
      ...event,
      _id: event._id.toString(),
    }));

    return processedEvents;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

// Generate metadata on the server
export const metadata = {
  title: "Events | FinTech Calgary",
  description:
    "Explore upcoming and past events from FinTech Calgary - Calgary's Premier FinTech Community",
  openGraph: {
    title: "Events | FinTech Calgary",
    description: "Explore upcoming and past events from FinTech Calgary",
  },
};

// Server Component
export default async function EventsPage() {
  // Fetch events on the server
  const response = await getEvents();

  // Filter events and webinars separately
  const events = response.filter((e) => e.eventType === "event");
  const webinars = response.filter((e) => e.eventType === "webinar");

  return <EventsPageClient initialEvents={events} initialWebinars={webinars} />;
}
