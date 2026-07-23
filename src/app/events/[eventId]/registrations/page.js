import EventRegistrations from "@/features/events/EventRegistrations";

export default async function EventRegistrationsPage({ params }) {
  const { eventId } = await params;

  return <EventRegistrations eventId={eventId} />;
}
