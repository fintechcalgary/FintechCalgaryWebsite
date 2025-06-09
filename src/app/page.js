"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Link from "next/link";
import AboutUs from "@/components/landing/AboutUs";
import UpcomingEvents from "@/components/landing/UpcomingEvents";
import Footer from "@/components/landing/Footer";
import Contact from "@/components/landing/Contact";
import { FiArrowRight } from "react-icons/fi";
import MissionStatement from "@/components/landing/MissionStatement";
import Partners from "@/components/landing/Partners";
import Image from "next/image";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);

  useEffect(() => {
    document.title = "FinTech Calgary";
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();

        const currentDate = new Date();

        // Filter only upcoming events
        const upcomingEvents = data.filter(
          (event) => new Date(event.date) >= currentDate
        );

        setEvents(upcomingEvents.slice(0, 4)); // Only show first 4 events
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    // Check for low performance devices
    const checkPerformance = () => {
      // Check if device is mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Check if device has low memory (if available)
      const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;

      // Check if device has low CPU cores (if available)
      const hasLowCPU =
        navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

      // Set as low performance if any conditions are true
      setIsLowPerfDevice(isMobile || hasLowMemory || hasLowCPU);
    };

    checkPerformance();
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900 overflow-hidden relative">
      <PublicNavbar />

      <div className="relative flex-grow">
        <section className="flex-grow flex items-center justify-center min-h-screen relative overflow-visible">
          <div className="absolute inset-0 overflow-visible">
            <Image
              src="/globe.svg"
              alt="Globe"
              width={500}
              height={500}
              className="absolute min-w-[100vw] min-h-[100vh] top-32 -right-32 max-md:min-w-[200vw] max-md:min-h-[200vh] max-md:-top-64 animate-rock opacity-80"
            />
          </div>
          <div className="text-center z-10 px-6 max-w-5xl mx-auto relative">
            <h1
              className={`text-7xl xl:text-8xl mb-2 bg-clip-text text-transparent py-6 bg-gradient-to-r from-primary via-purple-400 to-pink-500 font-black tracking-tight
                hover:scale-105 transition-all duration-500 ease-out
                ${isLowPerfDevice ? "" : "animate-fade-in-down"}`}
              style={{
                textShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.2),
                  0 1px 2px rgba(0,0,0,0.8),
                  0 2px 4px rgba(0,0,0,0.5),
                  0 4px 8px rgba(0,0,0,0.3),
                  0 8px 16px rgba(0,0,0,0.1)
                `,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}
            >
              FinTech Calgary
            </h1>
            <p
              className={`text-xl md:text-2xl xl:text-3xl mb-12 text-gray-300 font-light leading-relaxed ${
                isLowPerfDevice
                  ? ""
                  : "animate-fade-in-down animation-delay-300"
              }`}
            >
              Innovating the future of finance
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0 max-w-[280px] sm:max-w-none mx-auto animate-fade-in-up animation-delay-600">
              <Link
                href="/join"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-full 
           bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-purple-600 text-white transition-all duration-300 
           hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-1
           border border-primary/50 hover:border-primary"
              >
                Join Us
              </Link>
              <Link
                href="/associate-member-signup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-full 
                         border border-gray-700 hover:border-purple-500/40 text-white transition-all duration-300 
                         hover:shadow-xl hover:bg-gray-800/50 group"
              >
                Become an Associate
                <FiArrowRight className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="relative">
        {/* Section separator gradient */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
        <AboutUs />
      </div>

      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <MissionStatement />
      </div>

      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <UpcomingEvents events={events} />
      </div>

      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <Partners />
      </div>

      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <Contact />
      </div>

      <Footer />
    </main>
  );
}
