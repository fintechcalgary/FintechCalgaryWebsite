import EventRegistrations from "@/components/EventRegistrations";

export default async function EventRegistrationsPage({ params }) {
  const { eventId } = await params;

  return <EventRegistrations eventId={eventId} />;
}
