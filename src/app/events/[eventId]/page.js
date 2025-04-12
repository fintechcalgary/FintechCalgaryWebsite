"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiCalendar, FiClock, FiMapPin, FiArrowLeft } from "react-icons/fi";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import ImageCarousel from "@/components/ImageCarousel";
import Link from "next/link";
import Image from "next/image";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { motion } from "framer-motion";

export default function EventPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: { value: 10, density: { enable: true, value_area: 800 } },
      color: { value: "#6d28d9" },
      opacity: { value: 0.5 },
      size: { value: 3 },
      line_linked: {
        enable: false,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    retina_detect: true,
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params?.eventId}`);
        if (!response.ok) throw new Error("Event not found");
        const data = await response.json();
        setEvent(data);
        document.title = `${data.title} | FinTech Calgary`;
      } catch (error) {
        console.error("Failed to fetch event:", error);
        router.push("/events");
      } finally {
        setLoading(false);
      }
    };

    if (params?.eventId) {
      fetchEvent();
    }
  }, [params?.eventId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!event) return null;

  const isUpcoming = new Date(event.date) >= new Date();

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow">
        <Particles
          className="absolute inset-0 z-0"
          id="tsparticles"
          init={particlesInit}
          options={particlesConfig}
        />

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/events"
              className="inline-flex items-center px-4 py-2 group"
            >
              <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Events
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800/50 shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Image Section */}
              <div className="relative bg-gray-950 overflow-hidden flex items-center justify-center">
                {event.images?.length > 0 ? (
                  <div className="w-full h-full">
                    <ImageCarousel images={event.images} title={event.title} />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center p-8">
                    {/* Blurred background version of the image */}
                    <div className="absolute inset-0 overflow-hidden">
                      <Image
                        src={event.imageUrl}
                        alt=""
                        fill
                        className="object-cover blur-md scale-110 opacity-50"
                        priority
                      />
                    </div>

                    {/* Main image with proper dimensions */}
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      width={800}
                      height={600}
                      className="relative z-10 max-w-full max-h-[600px] object-contain"
                      priority
                    />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-8 lg:p-12">
                {/* Event Status */}
                <div className="mb-6">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isUpcoming
                        ? "bg-purple-600/20 text-purple-200 border border-purple-500/30"
                        : "bg-gray-800/20 text-gray-300 border border-gray-700/30"
                    }`}
                  >
                    {isUpcoming ? "Upcoming Event" : "Past Event"}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
                  {event.title}
                </h2>

                {/* Event Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-300">
                    <FiCalendar className="w-6 h-6 mr-4 text-primary" />
                    <span className="text-lg">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {event.time && (
                    <div className="flex items-center text-gray-300">
                      <FiClock className="w-6 h-6 mr-4 text-primary" />
                      <span className="text-lg">{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center text-gray-300">
                      <FiMapPin className="w-6 h-6 mr-4 text-primary" />
                      <span className="text-lg">{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="prose prose-invert max-w-none mb-8">
                  <div className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </div>
                </div>

                {/* Register Button for Upcoming Events */}
                {isUpcoming && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Link
                      href={`/events/register/${event._id}`}
                      className="inline-flex items-center px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                    >
                      Register Now
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
