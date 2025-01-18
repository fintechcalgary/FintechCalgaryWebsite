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
          <motion.h2
            className="text-6xl font-bold mb-20 text-center group cursor-pointer relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary flex items-center justify-center gap-4 hover:gap-6 transition-all duration-300">
                Future Events
                <FiArrowRight className="transition-all duration-300 text-primary text-4xl" />
              </span>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
            </div>
          </motion.h2>
        </Link>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
                viewport={{ once: true }}
                className="group"
              >
                <EventCard event={event} index={index} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-12 rounded-2xl border border-gray-700/50 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-50"></div>
            <p className="text-3xl text-gray-300 mb-4 relative">
              No events scheduled yet
            </p>
            <p className="text-xl text-gray-400 relative">
              Stay tuned for exciting upcoming events and opportunities!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
