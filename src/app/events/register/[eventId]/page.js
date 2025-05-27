"use client";
import { use } from "react";
import RegisterEventForm from "@/components/RegisterEventForm";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";

export default function RegisterEventPage({ params }) {
  const resolvedParams = use(params);
  const { eventId } = resolvedParams;

  return (
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="relative z-10">
          <RegisterEventForm eventId={eventId} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
