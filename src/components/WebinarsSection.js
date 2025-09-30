"use client";

import { useState, useCallback, useMemo } from "react";
import { FiVideo, FiCalendar } from "react-icons/fi";
import Image from "next/image";
import ImageCarousel from "@/components/ImageCarousel";
import { useRouter } from "next/navigation";

// Helper function to normalize dates to start of day for consistent comparison
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export default function WebinarsSection({ initialWebinars }) {
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  // Memoize the current date to prevent recalculation on every render
  const currentDate = useMemo(() => {
    const now = new Date();
    const normalized = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    return normalized;
  }, []);

  // Memoize the expensive filtering and sorting operation
  const filteredWebinars = useMemo(() => {
    const filtered = initialWebinars
      .filter((webinar) => {
        const webinarDate = normalizeDate(webinar.date);
        const isUpcoming = webinarDate >= currentDate;
        const isPast = webinarDate < currentDate;

        if (filter === "upcoming") return isUpcoming;
        if (filter === "past") return isPast;
        return true; // "all" filter
      })
      .sort((a, b) => {
        const aDate = normalizeDate(a.date);
        const bDate = normalizeDate(b.date);

        // Sort upcoming webinars before past webinars
        if (aDate >= currentDate && bDate < currentDate) return -1;
        if (aDate < currentDate && bDate >= currentDate) return 1;

        // For webinars in the same category, sort by date
        return aDate - bDate;
      });

    return filtered;
  }, [initialWebinars, filter, currentDate]);

  // Memoize the webinar click handler
  const handleWebinarClick = useCallback(
    (webinar) => {
      router.push(`/events/${webinar._id}`);
    },
    [router]
  );

  // Memoize the dynamic page heading content
  const pageContent = useMemo(() => {
    const headings = {
      all: {
        title: "All Webinars",
        description: "Explore all our past and upcoming webinars.",
      },
      upcoming: {
        title: "Upcoming Webinars",
        description: "Check out our upcoming webinars and register now.",
      },
      past: {
        title: "Past Webinars",
        description: "Take a look at our past webinars and recordings.",
      },
    };
    return headings[filter];
  }, [filter]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);

  return (
    <div className="mt-16">
      {/* Section Heading */}
      <div className="text-center mb-16 animate-fadeIn">
        <h2 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
          {pageContent.title}
        </h2>
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
          <option value="all">All Webinars</option>
          <option value="upcoming">Upcoming Webinars</option>
          <option value="past">Past Webinars</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredWebinars.map((webinar, index) => {
          const isUpcoming = normalizeDate(webinar.date) >= currentDate;
          return (
            <div
              key={webinar._id}
              onClick={() => handleWebinarClick(webinar)}
              className="group relative bg-gray-900/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-800/50 hover:border-primary/50 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glass Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Webinar Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {webinar.images?.length > 0 ? (
                  <ImageCarousel
                    images={webinar.images}
                    title={webinar.title}
                  />
                ) : (
                  <Image
                    src={webinar.imageUrl}
                    alt={webinar.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover"
                  />
                )}

                {/* Webinar Badge */}
                <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold rounded-full z-20 bg-primary/80 text-white border border-primary backdrop-blur-md">
                  <FiVideo className="inline w-3 h-3 mr-1" />
                  Webinar
                </span>

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

              {/* Webinar Content */}
              <div className="p-6 relative z-10">
                <h4 className="text-2xl font-bold text-white group-hover:text-primary transition-colors duration-300 mb-3">
                  {webinar.title}
                </h4>

                <div className="flex items-center space-x-2 text-gray-300 mb-4">
                  <FiCalendar className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">
                    {new Date(webinar.date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                    {webinar.time && (
                      <span className="ml-1 text-primary font-semibold">{` at ${webinar.time}`}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWebinars.length === 0 && (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg min-h-[400px] flex flex-col items-center justify-center mt-12 animate-fadeIn">
          <FiVideo className="mx-auto text-4xl text-primary mb-4" />
          <p className="text-gray-400">
            No webinars available for the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}
