import EventCard from "@/features/events/EventCard";
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/layout/LandingSection";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function UpcomingEvents({ events }) {
  return (
    <LandingSection id="events">
      <LandingContainer>
        <LandingSectionHeader href="/events">
          Upcoming Events & Webinars
        </LandingSectionHeader>

        {events.length > 0 ? (
          <>
            <div
              className={`mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 ${
                events.length === 1 ? "mx-auto md:max-w-4xl md:grid-cols-1" : ""
              }`}
            >
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            <div className="flex justify-center">
              <Link href="/events" className="fc-btn-secondary group">
                View All Events
                <FiArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        ) : (
          <GlowCard
            customSize
            glowColor="purple"
            className="mx-auto max-w-3xl !gap-0 !p-12 text-center"
          >
            <div className="relative z-10">
              <div className="fc-icon mx-auto mb-6">
                <FiCalendar className="h-8 w-8" />
              </div>
              <h3 className="fc-title mb-3 text-2xl">
                No events scheduled yet
              </h3>
              <p className="fc-body">
                New events will show up here when they&apos;re scheduled.
              </p>
            </div>
          </GlowCard>
        )}
      </LandingContainer>
    </LandingSection>
  );
}
