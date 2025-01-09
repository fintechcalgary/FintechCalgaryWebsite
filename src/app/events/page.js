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
        {/* Page Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
            All Events
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore all our past and upcoming events.
          </p>
        </motion.div>

        {/* Filter Dropdown - Move to right and widen */}
        <div className="flex justify-start mb-8">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 w-60 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const isUpcoming = new Date(event.date) >= new Date();
            return (
              <div
                key={event._id}
                className="bg-gray-800/50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Event Image */}
                <div className="aspect-video w-full">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Event Content */}
                <div className="p-6 space-y-4">
                  <h4 className="text-xl font-semibold text-white">
                    {event.title}
                  </h4>

                  <p className="text-sm text-gray-400">
                    {new Date(event.date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                    {event.time && ` at ${event.time}`}
                  </p>

                  {/* Event Status and Register Button */}
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        isUpcoming
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {isUpcoming ? "Upcoming" : "Past"}
                    </span>

                    {isUpcoming && (
                      <a
                        href={`/events/register/${event._id}`}
                        className="px-3 py-1 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-full transition-colors"
                      >
                        Register Now
                      </a>
                    )}
                  </div>
                </div>
              </div>
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
