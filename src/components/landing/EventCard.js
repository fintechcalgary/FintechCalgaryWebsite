import { motion } from "framer-motion";
import Link from "next/link";

export default function EventCard({ event, index }) {
  return (
    <div className="relative h-[400px] group">
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          backgroundImage: event.imageUrl
            ? `url(${event.imageUrl})`
            : "linear-gradient(to bottom right, rgb(147, 51, 234), rgb(79, 70, 229))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
      </div>

      <div className="relative h-full p-8 flex flex-col justify-end">
        <div className="space-y-4">
          {/* Date badge */}
          <div className="inline-block px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/20 text-sm text-white">
            {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {event.time && ` • ${event.time}`}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white transition-colors duration-300">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-gray-300 line-clamp-2">{event.description}</p>

          {/* Register button */}
          <Link
            href={`/events/register/${event._id}`}
            className="inline-flex items-center px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
