"use client";

import Link from "next/link";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { formatEventDate } from "@/lib/dates";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function EventCard({ event }) {
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
      <GlowCard
        customSize
        glowColor="purple"
        className="group h-[400px] w-full !gap-0 !p-0"
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{
            backgroundImage: images[currentImageIndex]
              ? `url(${images[currentImageIndex]})`
              : "linear-gradient(to bottom right, rgb(124, 58, 237), rgb(139, 92, 246))",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-image 0.3s ease-in-out",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity duration-300 hover:bg-black/70 group-hover:opacity-100"
              >
                <FiChevronLeft size={24} />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity duration-300 hover:bg-black/70 group-hover:opacity-100"
              >
                <FiChevronRight size={24} />
              </button>

              <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleImageDotClick(e, idx)}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex
                        ? "w-4 bg-white"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="inline-block rounded-full border border-primary/20 bg-primary/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                {formatEventDate(event.date)}
                {event.time && ` • ${event.time}`}
              </div>
              {event.eventType === "webinar" && (
                <div className="inline-block rounded-full border border-purple-500/20 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-200 backdrop-blur-sm">
                  Webinar
                </div>
              )}
            </div>

            <h3 className="fc-title text-2xl font-bold transition-colors duration-300 group-hover:text-primary">
              {event.title}
            </h3>

            <p className="fc-body line-clamp-2">
              {event.description}
            </p>

            <div className="inline-flex items-center rounded-xl bg-primary/90 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/15">
              {event.eventType === "webinar" ? "View Webinar" : "View Event"}
            </div>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}
