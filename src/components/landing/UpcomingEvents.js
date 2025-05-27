import EventCard from "./EventCard";
import { FiCalendar } from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";

export default function UpcomingEvents({ events }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section id="events" className="py-24">
      <div className="container mx-auto px-4">
        {/* Simplified title */}
        <Link href="/events">
          <h2 className="text-6xl font-bold mb-20 text-center hover:opacity-90 transition-opacity">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Upcoming Events
            </span>
          </h2>
        </Link>

        {events.length > 0 ? (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto ${
              events.length === 1 ? "md:grid-cols-1 md:max-w-4xl" : ""
            }`}
          >
            {events.map((event, index) => (
              <div
                key={event._id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative transition-transform duration-300 hover:-translate-y-2"
              >
                {/* Simplified highlight effect */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity duration-300 ${
                    hoveredIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                />

                <div className="relative">
                  <EventCard event={event} index={index} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-xl p-12 rounded-2xl border border-gray-700/50 max-w-3xl mx-auto text-center">
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
        )}
      </div>
    </section>
  );
}
