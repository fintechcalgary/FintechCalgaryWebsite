"use client";

import { useState, useCallback, useMemo } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import { FiCalendar } from "react-icons/fi";
import Image from "next/image";
import ImageCarousel from "@/components/ImageCarousel";
import { useRouter } from "next/navigation";

export default function EventsPageClient({ initialEvents }) {
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  // Memoize the current date to prevent recalculation on every render
  const currentDate = useMemo(() => new Date(), []);

  // Memoize the expensive filtering and sorting operation
  const filteredEvents = useMemo(() => {
    return initialEvents
      .filter((event) => {
        const eventDate = new Date(event.date);
        if (filter === "upcoming") return eventDate >= currentDate;
        if (filter === "past") return eventDate < currentDate;
        return true; // "all" filter
      })
      .sort((a, b) => {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);

        // Sort upcoming events before past events
        if (aDate >= currentDate && bDate < currentDate) return -1;
        if (aDate < currentDate && bDate >= currentDate) return 1;

        // For events in the same category (both upcoming or both past), sort by date
        return aDate - bDate;
      });
  }, [initialEvents, filter, currentDate]);

  // Memoize the event click handler
  const handleEventClick = useCallback(
    (event) => {
      const isUpcoming = new Date(event.date) >= currentDate;
      if (isUpcoming) {
        router.push(`/events/register/${event._id}`);
      } else {
        router.push(`/events/${event._id}`);
      }
    },
    [router, currentDate]
  );

  // Memoize the dynamic page heading content
  const pageContent = useMemo(() => {
    const headings = {
      all: {
        title: "All Events",
        description: "Explore all our past and upcoming events.",
      },
      upcoming: {
        title: "Upcoming Events",
        description: "Check out our upcoming events and register now.",
      },
      past: {
        title: "Past Events",
        description:
          "Take a look at our past events and what we've accomplished.",
      },
    };
    return headings[filter];
  }, [filter]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);

  return (
    <main className="flex flex-col min-h-screen">
      {/* Navbar */}
      <PublicNavbar />

      {/* Page Content */}
      <div className="container mx-auto px-6 py-24 sm:px-8 lg:px-12 relative z-10">
        {/* Dynamic Page Heading */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
            {pageContent.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {pageContent.description}
          </p>
        </div>

        {/* Filter Dropdown - Enhanced styling */}
        <div className="flex mb-8" style={{ animationDelay: "200ms" }}>
          <select
            value={filter}
            onChange={handleFilterChange}
            className="px-6 py-3 w-64 bg-gray-800/50 text-white rounded-lg border border-gray-600 
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            shadow-lg backdrop-blur-sm
            pl-6 pr-12 hover:bg-gray-700/50"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => {
            const isUpcoming = new Date(event.date) >= currentDate;
            return (
              <div
                key={event._id}
                onClick={() => handleEventClick(event)}
                className="group relative bg-gray-900/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-800/50 hover:border-primary/50 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glass Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Event Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
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
                  <span
                    className={`absolute top-4 right-4 px-4 py-1.5 text-xs font-semibold rounded-full z-20
                    ${
                      isUpcoming
                        ? "bg-purple-600/60 text-purple-100 border border-purple-500 backdrop-blur-md"
                        : "bg-gray-800/60 text-gray-300 border border-gray-700 backdrop-blur-md"
                    }`}
                  >
                    {isUpcoming ? "Upcoming" : "Past"}
                  </span>
                </div>

                {/* Event Content */}
                <div className="p-6 relative z-10">
                  <h4 className="text-2xl font-bold text-white group-hover:text-primary transition-colors duration-300 mb-3">
                    {event.title}
                  </h4>

                  <div className="flex items-center space-x-2 text-gray-300 mb-4">
                    <FiCalendar className="w-4 h-4 text-primary" />
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
                        <span className="ml-1 text-primary font-semibold">{` at ${event.time}`}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg min-h-[400px] flex flex-col items-center justify-center mt-12 animate-fadeIn">
            <FiCalendar className="mx-auto text-4xl text-primary mb-4" />
            <p className="text-gray-400">
              No events available for the selected filter.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
