"use client";
import { use } from "react";
import RegisterEventForm from "@/features/events/RegisterEventForm";
import PublicPageShell from "@/components/layout/PublicPageShell";

export default function RegisterEventPage({ params }) {
  const resolvedParams = use(params);
  const { eventId } = resolvedParams;

  return (
    <PublicPageShell>

      <div className="relative flex-grow">
        <div className="relative z-10">
          <RegisterEventForm eventId={eventId} />
        </div>
      </div>
    </PublicPageShell>
  );
}
