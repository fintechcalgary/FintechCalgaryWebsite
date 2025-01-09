import { motion } from "framer-motion";
import EventCard from "./EventCard";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function UpcomingEvents({ events }) {
  return (
    <section id="events" className="py-16 relative">
      <div className="container mx-auto px-4">
        <Link href="/events">
          <motion.h2
            className="text-5xl font-bold mb-8 py-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 text-center flex items-center justify-center gap-4 hover:gap-6 group cursor-pointer transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Upcoming Events
            <FiArrowRight className="transition-all duration-300 text-primary" />
          </motion.h2>
        </Link>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {events.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-2xl text-gray-400 mb-3">
              No events scheduled yet
            </p>
            <p className="text-gray-500">
              Stay tuned for exciting upcoming events and opportunities!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
