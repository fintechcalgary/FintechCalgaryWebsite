"use client";

import { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Link from "next/link";
import AboutUs from "@/components/landing/AboutUs";
import UpcomingEvents from "@/components/landing/UpcomingEvents";
import Webinars from "@/components/landing/Webinars";
import Footer from "@/components/landing/Footer";
import Contact from "@/components/landing/Contact";
import { FiArrowRight } from "react-icons/fi";
import MissionStatement from "@/components/landing/MissionStatement";
import Partners from "@/components/landing/Partners";
import ExecutiveApplications from "@/components/landing/ExecutiveApplications";
import ExecutiveApplicationBanner from "@/components/ExecutiveApplicationBanner";
import Image from "next/image";
import { useSettings } from "@/contexts/SettingsContext";

// Helper function to normalize dates to start of day for consistent comparison
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export default function Home() {
  const [events, setEvents] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const { executiveApplicationsOpen, settingsLoaded } = useSettings();

  useEffect(() => {
    document.title = "FinTech Calgary";
  }, []);

  useEffect(() => {
    let isMounted = true;

    // fetches both events and webinars
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok && isMounted) {
          const data = await response.json();

          const currentDate = new Date();
          const normalizedCurrentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
          );

          // Filter only upcoming events
          const upcomingEvents = data
            .filter((e) => e.eventType === "event")
            .filter((e) => normalizeDate(e.date) >= normalizedCurrentDate);

          const allWebinars = data.filter((e) => e.eventType === "webinar");

          if (isMounted) {
            setEvents(upcomingEvents.slice(0, 4)); // Only show first 4 events
            setWebinars(allWebinars);
          }
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="flex flex-col min-h-screen overflow-hidden relative">
      <PublicNavbar />

      <div className="relative flex-grow">
        <section className="flex-grow flex items-center justify-center min-h-screen relative overflow-visible">
          <div className="absolute inset-0 overflow-visible">
            <Image
              src="/globe.svg"
              alt="Globe"
              width={500}
              height={500}
              className="absolute min-w-[100vw] min-h-[100vh] top-32 -right-32 max-md:min-w-[200vw] max-md:min-h-[200vh] max-md:-top-64 opacity-100"
            />
          </div>
          <div className="text-center z-10 px-6 max-w-5xl mx-auto relative">
            <h1
              className="text-7xl xl:text-8xl mb-2 bg-clip-text text-transparent py-6 bg-gradient-to-r from-primary via-purple-400 to-pink-500 font-black tracking-tight
                hover:scale-105 transition-all duration-500 ease-out animate-fade-in-down"
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
            <p className="text-xl md:text-2xl xl:text-3xl mb-12 text-gray-300 font-light leading-relaxed animate-fade-in-down animation-delay-300">
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
        {settingsLoaded && executiveApplicationsOpen && (
          <ExecutiveApplications />
        )}
      </div>

      <div className="relative">
        <AboutUs />
      </div>

      <div className="relative">
        <MissionStatement />
      </div>

      <div className="relative">
        <UpcomingEvents events={events} />
      </div>

      <div className="relative">
        <Webinars events={webinars} />
      </div>

      <div className="relative">
        <Partners />
      </div>

      <div className="relative">
        <Contact />
      </div>

      <div className="relative">
        <ExecutiveApplicationBanner />
      </div>

      <Footer />
    </main>
  );
}
