import EventCard from "./EventCard";
import { FiCalendar } from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";

export default function UpcomingEvents({ events }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section id="events" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Title with hover effect */}
        <Link href="/events">
          <h2 className="text-6xl font-bold mb-20 text-center group cursor-pointer relative">
            <div className="relative inline-block">
              <div
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary 
                         flex items-center justify-center gap-4 group-hover:gap-6 transition-all duration-300"
              >
                Upcoming Events
              </div>
              <div
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </h2>
        </Link>

        {events.length > 0 ? (
          <div
            className={`grid grid-cols-1 md:grid-cols-${
              events.length === 1 ? "1" : "2"
            } gap-10 max-w-6xl mx-auto ${
              events.length === 1 ? "md:max-w-4xl" : ""
            }`}
            style={{
              opacity: 1,
              transition: "opacity 0.5s",
            }}
          >
            {events.map((event, index) => (
              <div
                key={event._id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative ${
                  events.length === 1 ? "md:w-[800px] mx-auto" : ""
                }`}
                style={{
                  opacity: 1,
                  transform: "translateY(0)",
                  transition: "opacity 0.3s, transform 0.3s",
                }}
              >
                {/* Highlight effect */}
                <div
                  className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl"
                  style={{
                    opacity: hoveredIndex === index ? 1 : 0,
                    transform: `scale(${hoveredIndex === index ? 1 : 0.8})`,
                    transition: "opacity 0.3s, transform 0.3s",
                  }}
                />

                {/* Event card wrapper with animations */}
                <div
                  style={{
                    transform: `scale(${
                      hoveredIndex === index ? 1.02 : 1
                    }) translateY(${hoveredIndex === index ? -5 : 0}px)`,
                    transition: "transform 0.3s",
                  }}
                >
                  <EventCard event={event} index={index} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl 
                     p-12 rounded-2xl border border-gray-700/50 max-w-3xl mx-auto text-center"
            style={{
              opacity: 1,
              transform: "translateY(0)",
              transition: "opacity 0.3s, transform 0.3s",
            }}
          >
            {/* Empty state animation */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl"
              style={{
                animation: "pulse 4s infinite alternate",
              }}
            />

            {/* Empty state content */}
            <div className="relative space-y-4">
              <div className="w-16 h-16 mx-auto mb-6 text-primary/50">
                <FiCalendar className="w-full h-full" />
              </div>
              <p className="text-3xl text-gray-300 mb-4">
                No events scheduled yet
              </p>
              <p className="text-xl text-gray-400">
                Stay tuned for exciting upcoming events and opportunities!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
