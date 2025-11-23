import { connectToDatabase } from "@/lib/mongodb";
import EventsPageClient from "./EventsPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  title: "Events and Webinars | FinTech Calgary",
  description:
    "Explore upcoming and past events and webinars from FinTech Calgary - Calgary's Premier FinTech Community",
  openGraph: {
    title: "Events and Webinars | FinTech Calgary",
    description:
      "Explore upcoming and past events and webinars from FinTech Calgary",
  },
};

// Server Component
export default async function EventsPage() {
  // Fetch events on the server
  const response = await getEvents();

  // Combine all events and webinars into a single list
  const allEvents = response;

  return <EventsPageClient initialEvents={allEvents} />;
}
