import RegisterEventForm from "@/components/RegisterEventForm";

export default async function RegisterEventPage({ params }) {
  const { eventId } = await params;
  return <RegisterEventForm eventId={eventId} />;
}
