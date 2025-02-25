import { motion } from "framer-motion";
import EventCard from "./EventCard";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function UpcomingEvents({ events }) {
  return (
    <section id="events" className="py-24 relative">
      <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center"></div>
      <div className="container mx-auto px-4">
        <Link href="/events">
          <h2 className="text-6xl font-bold mb-20 text-center group cursor-pointer relative">
            <div className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary flex items-center justify-center gap-4 hover:gap-6 transition-all duration-300">
                Upcoming
                <FiArrowRight className="transition-all duration-300 text-primary text-4xl" />
              </span>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
            </div>
          </h2>
        </Link>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {events.map((event, index) => (
              <div key={event._id} className="group">
                <EventCard event={event} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-12 rounded-2xl border border-gray-700/50 max-w-3xl mx-auto text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-50"></div>
            <p className="text-3xl text-gray-300 mb-4 relative">
              No events scheduled yet
            </p>
            <p className="text-xl text-gray-400 relative">
              Stay tuned for exciting upcoming events and opportunities!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
