"use client";

import { useState, useCallback, useMemo } from "react";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";
import { FiCalendar } from "react-icons/fi";
import Image from "next/image";
import ImageCarousel from "@/features/events/ImageCarousel";
import { useRouter } from "next/navigation";
import { normalizeDate, startOfToday } from "@/lib/dates";

export default function EventsPageClient({ initialEvents }) {
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  // Memoize the current date to prevent recalculation on every render
  // Normalize to start of day for consistent comparison
  const currentDate = useMemo(() => startOfToday(), []);

  // Memoize the expensive filtering and sorting operation
  const filteredEvents = useMemo(() => {
    const filtered = initialEvents
      .filter((event) => {
        const eventDate = normalizeDate(event.date);
        const isUpcoming = eventDate >= currentDate;
        const isPast = eventDate < currentDate;
        const isPartner = event.isPartner;

        // Hide partner events for all filters except "partner"
        if (filter !== "partner" && isPartner) return false;

        if (filter === "upcoming") return isUpcoming;
        else if (filter === "past") return isPast;
        else if (filter === "partner") return isPartner;

        // "all" filter (show all events except partner)
        return true;
      })
      .sort((a, b) => {
        const aDate = normalizeDate(a.date);
        const bDate = normalizeDate(b.date);

        // Sort upcoming events before past events
        if (aDate >= currentDate && bDate < currentDate) return -1;
        if (aDate < currentDate && bDate >= currentDate) return 1;

        // For events in the same category (both upcoming or both past), sort by date
        return aDate - bDate;
      });

    return filtered;
  }, [initialEvents, filter, currentDate]);

  // Memoize the event click handler
  const handleEventClick = useCallback(
    (event) => {
      // Route all events to the individual event page
      router.push(`/events/${event._id}`);
    },
    [router]
  );

  // Memoize the dynamic page heading content
  const pageContent = useMemo(() => {
    const headings = {
      all: {
        title: "Events and Webinars",
        description: "Explore all our past and upcoming events and webinars.",
      },
      upcoming: {
        title: "Upcoming Events and Webinars",
        description:
          "Check out our upcoming events and webinars and register now.",
      },
      past: {
        title: "Past Events and Webinars",
        description:
          "Take a look at our past events and webinars and what we've accomplished.",
      },
      partner: {
        title: "Partner Events",
        description: "Explore all of our partner events.",
      },
    };
    return headings[filter];
  }, [filter]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);

  return (
    <PublicPageShell title="Events | FinTech Calgary">
      {/* Page Content */}
      <div className="container mx-auto px-6 pt-36 pb-24 sm:px-8 lg:px-12 relative z-10 flex-grow">
        {/* Dynamic Page Heading */}
        <div className="text-center mb-16 animate-fadeIn">
          <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-6">
            {pageContent.title}
          </PageTitle>
          <p className="fc-lede mx-auto max-w-3xl">
            {pageContent.description}
          </p>
        </div>

        {/* Filter Dropdown - Enhanced styling */}
        <div className="flex mb-8" style={{ animationDelay: "200ms" }}>
          <select
            value={filter}
            onChange={handleFilterChange}
            className="px-6 py-3 w-64 bg-gray-800/50 text-white rounded-xl border border-gray-600 
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            shadow-lg backdrop-blur-sm
            pl-6 pr-12 hover:bg-gray-700/50"
          >
            <option value="all">All Events & Webinars</option>
            <option value="upcoming">Upcoming Events & Webinars</option>
            <option value="past">Past Events & Webinars</option>
            <option value="partner">Partner Events</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => {
            const isUpcoming = normalizeDate(event.date) >= currentDate;
            return (
              <div
                key={event._id}
                onClick={() => handleEventClick(event)}
                className="h-full cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GlowCard
                  customSize
                  glowColor="purple"
                  className="group relative flex h-full w-full flex-col !gap-0 !overflow-hidden !p-0"
                >
                  {/* Event Image Container */}
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
                    {event.images?.length > 0 ? (
                      <ImageCarousel images={event.images} title={event.title} />
                    ) : (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        className="object-cover"
                      />
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                      <span
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full flex items-center justify-center
                        ${
                          isUpcoming
                            ? "bg-purple-600/60 text-purple-100 border border-purple-500 backdrop-blur-md"
                            : "bg-gray-800/60 text-gray-300 border border-gray-700 backdrop-blur-md"
                        }`}
                      >
                        {isUpcoming ? "Upcoming" : "Past"}
                      </span>
                      {event.eventType === "webinar" && (
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-purple-600/60 text-purple-100 border border-purple-500 backdrop-blur-md flex items-center justify-center">
                          Webinar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="relative z-10 flex flex-1 flex-col p-6">
                    <h4 className="fc-title mb-3 line-clamp-2 min-h-[2.5em] text-xl transition-colors duration-300 group-hover:text-primary sm:text-2xl">
                      {event.title}
                    </h4>

                    <div className="mt-auto flex items-center space-x-2 fc-body">
                      <FiCalendar className="h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm font-medium">
                        {new Date(event.date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                        {event.time && (
                          <span className="ml-1 font-semibold text-primary">{` at ${event.time}`}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </GlowCard>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl min-h-[400px] flex flex-col items-center justify-center mt-12 animate-fadeIn">
            <FiCalendar className="mx-auto text-4xl text-primary mb-4" />
            <p className="fc-muted">
              No events or webinars available for the selected filter.
            </p>
          </div>
        )}
      </div>
    </PublicPageShell>
  );
}
