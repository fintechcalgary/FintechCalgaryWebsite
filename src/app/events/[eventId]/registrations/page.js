import EventRegistrations from "@/components/EventRegistrations";

export default function EventRegistrationsPage({ params }) {
  return <EventRegistrations eventId={params.eventId} />;
}
