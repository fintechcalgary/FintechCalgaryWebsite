import { connectToDatabase } from "@/lib/mongodb";
import EventsPageClient from "./EventsPageClient";

// Server-side data fetching function
async function getEvents() {
  try {
    const db = await connectToDatabase();
    console.log("🔍 Fetching events from database...");

    const events = await db
      .collection("events")
      .find({})
      .sort({ date: 1 })
      .toArray();

    console.log(`📅 Found ${events.length} events in database`);
    console.log(
      "📋 Events:",
      events.map((e) => ({ id: e._id, title: e.title, date: e.date }))
    );

    // Convert MongoDB documents to plain objects and handle ObjectId
    const processedEvents = events.map((event) => ({
      ...event,
      _id: event._id.toString(),
    }));

    console.log(`✅ Processed ${processedEvents.length} events`);
    return processedEvents;
  } catch (error) {
    console.error("❌ Failed to fetch events:", error);
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
  const events = await getEvents();
  console.log(`🚀 EventsPage: Passing ${events.length} events to client`);

  return <EventsPageClient initialEvents={events} />;
}
