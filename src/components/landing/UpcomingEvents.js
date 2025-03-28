import { motion } from "framer-motion";
import EventCard from "./EventCard";
import { FiCalendar } from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";

export default function UpcomingEvents({ events }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section id="events" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Animated title with hover effect */}
        <Link href="/events">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl font-bold mb-20 text-center group cursor-pointer relative"
          >
            <div className="relative inline-block">
              <motion.div
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary 
                         flex items-center justify-center gap-4 group-hover:gap-6 transition-all duration-300"
              >
                Upcoming Events
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"
              />
            </div>
          </motion.h2>
        </Link>

        {events.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`grid grid-cols-1 md:grid-cols-${
              events.length === 1 ? "1" : "2"
            } gap-10 max-w-6xl mx-auto ${
              events.length === 1 ? "md:max-w-4xl" : ""
            }`}
          >
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className={`group relative ${
                  events.length === 1 ? "md:w-[800px] mx-auto" : ""
                }`}
              >
                {/* Animated highlight effect */}
                <motion.div
                  animate={{
                    opacity: hoveredIndex === index ? 1 : 0,
                    scale: hoveredIndex === index ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl"
                />

                {/* Event card wrapper with animations */}
                <motion.div
                  animate={{
                    scale: hoveredIndex === index ? 1.02 : 1,
                    y: hoveredIndex === index ? -5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <EventCard event={event} index={index} />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl 
                     p-12 rounded-2xl border border-gray-700/50 max-w-3xl mx-auto text-center"
          >
            {/* Empty state animation */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl"
            />

            {/* Empty state content */}
            <div className="relative space-y-4">
              <motion.div
                animate={{ rotate: [0, 5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="w-16 h-16 mx-auto mb-6 text-primary/50"
              >
                <FiCalendar className="w-full h-full" />
              </motion.div>
              <p className="text-3xl text-gray-300 mb-4">
                No events scheduled yet
              </p>
              <p className="text-xl text-gray-400">
                Stay tuned for exciting upcoming events and opportunities!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
