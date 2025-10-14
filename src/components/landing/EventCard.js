import Link from "next/link";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function EventCard({ event, index }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = event.images?.length > 0 ? event.images : [event.imageUrl];

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageDotClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(idx);
  };

  return (
    <Link href={`/events/${event._id}`} className="block">
      <div className="relative h-[400px] group w-full cursor-pointer">
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backgroundImage: images[currentImageIndex]
              ? `url(${images[currentImageIndex]})`
              : "linear-gradient(to bottom right, rgb(147, 51, 234), rgb(79, 70, 229))",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-image 0.3s ease-in-out",
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />

          {/* Navigation arrows - only show if there are multiple images */}
          {images.length > 1 && (
            <>
              {/* Left arrow */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <FiChevronLeft size={24} />
              </button>

              {/* Right arrow */}
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <FiChevronRight size={24} />
              </button>

              {/* Image indicator dots */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleImageDotClick(e, idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative h-full p-8 flex flex-col justify-end">
          <div className="space-y-4">
            {/* Date badge and webinar indicator */}
            <div className="flex flex-wrap gap-2">
              <div className="inline-block px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/20 text-sm text-white">
                {new Date(event.date + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
                {event.time && ` • ${event.time}`}
              </div>
              {event.eventType === "webinar" && (
                <div className="inline-block px-3 py-2 rounded-full bg-blue-600/20 backdrop-blur-sm border border-blue-500/20 text-sm text-blue-100">
                  Webinar
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white transition-colors duration-300">
              {event.title}
            </h3>

            {/* Description */}
            <p className="text-gray-300 line-clamp-2">{event.description}</p>

            {/* View Event/Webinar button */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-105">
              {event.eventType === "webinar" ? "View Webinar" : "View Event"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
