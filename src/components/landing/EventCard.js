import { motion } from "framer-motion";
import Link from "next/link";

export default function EventCard({ event, index }) {
  return (
    <motion.div
      className="bg-gray-800/50 p-8 rounded-xl border border-gray-700/50 shadow-lg hover:shadow-xl transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true }}
    >
      {event.imageUrl && (
        <div className="mb-6">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
        {event.title}
      </h3>
      <p className="mb-4 text-gray-300 line-clamp-3">{event.description}</p>
      <div className="mb-6 text-sm text-gray-400">
        {new Date(event.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        {event.time && ` at ${event.time}`}
      </div>
      <Link
        href={`/events/register/${event._id}`}
        className="mt-4 inline-block bg-primary hover:bg-primary/80 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
      >
        Register for Event
      </Link>
    </motion.div>
  );
}
