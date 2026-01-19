import EventCard from "./EventCard";
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";

export default function UpcomingEvents({ events }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section id="events" className="py-24 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
               backgroundSize: '40px 40px'
             }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="mb-16 md:mb-20 text-center">
          <Link href="/events" className="group inline-block relative">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6">
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500 animate-gradient">
                  Upcoming Events & Webinars
                </span>
                <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300">
                  Upcoming Events & Webinars
                </span>
              </span>
            </h2>
            <div className="relative h-1 w-full max-w-xs mx-auto mt-2 md:mt-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm"></div>
              <div className="relative h-full bg-gradient-to-r from-primary via-purple-400 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
          </Link>
        </div>

        {events.length > 0 ? (
          <>
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12 ${
                events.length === 1 ? "md:grid-cols-1 md:max-w-4xl mx-auto" : ""
              }`}
            >
              {events.map((event, index) => (
                <div
                  key={event._id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group relative transition-all duration-300"
                >
                  <div className="relative">
                    <EventCard event={event} index={index} />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Events Link */}
            <div className="flex justify-center">
              <Link
                href="/events"
                className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-medium rounded-full 
                         border border-gray-700 hover:border-primary/50 text-white transition-all duration-300 
                         hover:shadow-xl hover:bg-gray-800/50"
              >
                View All Events
                <FiArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        ) : (
          <div className="relative p-12 rounded-2xl border border-gray-800/50 
                        bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm
                        max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary/10 border border-primary/20 
                          flex items-center justify-center">
              <FiCalendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No events scheduled yet
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Stay tuned for exciting upcoming events and webinars!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
