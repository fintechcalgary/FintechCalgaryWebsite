import EventCard from "@/features/events/EventCard";
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";

export default function UpcomingEvents({ events }) {
  return (
    <section id="events" className="relative overflow-hidden py-24">
      <div className="container relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center md:mb-20">
          <SectionHeading href="/events">
            Upcoming Events & Webinars
          </SectionHeading>
        </div>

        {events.length > 0 ? (
          <>
            <div
              className={`mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 ${
                events.length === 1 ? "mx-auto md:max-w-4xl md:grid-cols-1" : ""
              }`}
            >
              {events.map((event) => (
                <div
                  key={event._id}
                  className="group relative transition-all duration-300"
                >
                  <div className="relative">
                    <EventCard event={event} />
                  </div>
                </div>
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
          <div className="fc-card mx-auto max-w-3xl p-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <FiCalendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">
              No events scheduled yet
            </h3>
            <p className="leading-relaxed text-gray-400">
              New events will show up here when they&apos;re scheduled.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
