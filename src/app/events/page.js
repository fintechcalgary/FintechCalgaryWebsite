"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import { FiCalendar } from "react-icons/fi";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const particlesRef = useRef(null);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 1200 } },
      color: { value: "#8b5cf6" },
      opacity: { value: 0.8 },
      size: { value: 2 },
      move: { enable: true, speed: 0.8, random: true, out_mode: "out" },
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "grab" } },
    },
    retina_detect: true,
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      const currentDate = new Date();
      if (filter === "upcoming") return eventDate >= currentDate;
      if (filter === "past") return eventDate < currentDate;
      return true; // "all" filter
    })
    .sort((a, b) => {
      const currentDate = new Date();
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);

      // Sort upcoming events before past events
      if (aDate >= currentDate && bDate < currentDate) return -1;
      if (aDate < currentDate && bDate >= currentDate) return 1;

      // For events in the same category (both upcoming or both past), sort by date
      return aDate - bDate;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      {/* Navbar */}
      <PublicNavbar />

      {/* Particles Background */}
      <div ref={particlesRef} className="relative">
        <Particles
          init={particlesInit}
          options={particlesConfig}
          className="absolute inset-0 z-0"
        />
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-6 py-24 sm:px-8 lg:px-12 relative z-10">
        {/* Dynamic Page Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
            {filter === "all"
              ? "All Events"
              : filter === "upcoming"
              ? "Upcoming Events"
              : "Past Events"}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {filter === "all"
              ? "Explore all our past and upcoming events."
              : filter === "upcoming"
              ? "Check out our upcoming events and register now."
              : "Take a look at our past events and what we've accomplished."}
          </p>
        </motion.div>

        {/* Filter Dropdown - Enhanced styling */}
        <div className="flex mb-8">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none px-6 py-3 w-64 bg-gray-800/50 text-white rounded-lg border border-gray-600 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              shadow-lg backdrop-blur-sm
              pl-6 pr-12 hover:bg-gray-700/50 transition-colors"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const isUpcoming = new Date(event.date) >= new Date();
            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-gray-900/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-800/50 hover:border-primary/50"
              >
                {/* Glass Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Event Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* Status Badge - Moved to top-right of image */}
                  <span
                    className={`absolute top-4 right-4 px-4 py-1.5 text-xs font-medium rounded-full 
                    ${
                      isUpcoming
                        ? "bg-primary/30 text-primary border border-primary/40 backdrop-blur-sm"
                        : "bg-gray-800/50 text-gray-300 border border-gray-700/50 backdrop-blur-sm"
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

                  {/* Register Button - Full width with new styling */}
                  {isUpcoming && (
                    <a
                      href={`/events/register/${event._id}`}
                      className="block w-full text-center px-6 py-2.5 text-sm font-semibold text-white 
                      bg-gradient-to-r from-primary via-primary/90 to-primary 
                      rounded-xl hover:from-primary/90 hover:via-primary hover:to-primary/90 
                      transform hover:-translate-y-0.5 transition-all duration-300 
                      shadow-lg hover:shadow-primary/25"
                    >
                      Register Now
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg min-h-[400px] flex flex-col items-center justify-center mt-12">
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
