"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Link from "next/link";
import AboutUs from "@/components/landing/AboutUs";
import UpcomingEvents from "@/components/landing/UpcomingEvents";
import Footer from "@/components/landing/Footer";
import Contact from "@/components/landing/Contact";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { FiArrowRight } from "react-icons/fi";
import MissionStatement from "@/components/landing/MissionStatement";
import Partners from "@/components/landing/Partners";
import Image from "next/image";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

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

  const particlesConfig = {
    particles: {
      number: { value: 15, density: { enable: true, value_area: 1000 } },
      color: { value: "#6d28d9" },
      opacity: { value: 0.5 },
      size: { value: 3 },
      line_linked: {
        enable: false,
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    retina_detect: false,
  };

  const simplifiedParticlesConfig = {
    particles: {
      number: { value: 8, density: { enable: true, value_area: 1500 } },
      color: { value: "#6d28d9" },
      opacity: { value: 0.4 },
      size: { value: 2 },
      line_linked: {
        enable: false,
      },
      move: {
        enable: true,
        speed: 0.3,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    retina_detect: false,
  };

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900 overflow-hidden">
      <PublicNavbar />

      <div className="relative flex-grow">
        {!isLowPerfDevice && (
          <>
            <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-primary/30 max-md:bg-primary/20 rounded-full blur-[80px] -translate-x-1/2"></div>
            <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-purple-500/30 max-md:bg-purple-500/10 rounded-full blur-[60px] translate-x-1/2"></div>
          </>
        )}

        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={
            isLowPerfDevice ? simplifiedParticlesConfig : particlesConfig
          }
        />

        <section className="flex-grow flex items-center justify-center min-h-screen relative overflow-visible">
          <div className="absolute inset-0 overflow-visible">
            <Image
              src="/globe.svg"
              alt="Globe"
              width={500}
              height={500}
              className="absolute min-w-[100vw] min-h-[100vh] top-32 -right-32 max-md:min-w-[200vw] max-md:min-h-[200vh] max-md:-top-64 animate-rock"
            />
          </div>
          <div className="text-center z-10 px-6 max-w-5xl mx-auto relative">
            <h1
              className={`text-7xl xl:text-8xl mb-2 bg-clip-text text-transparent py-6 bg-gradient-to-r from-primary via-purple-400 to-pink-500 font-black ${
                isLowPerfDevice ? "" : "animate-fade-in-down"
              }`}
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
           bg-primary hover:bg-primary/90 text-white transition-all duration-300 
           hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-1
           border border-primary/50 hover:border-primary"
              >
                Join Us
              </Link>
              <Link
                href="/executives"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-full 
                         border border-gray-700 hover:border-primary/50 text-white transition-all duration-300 
                         hover:shadow-xl hover:bg-gray-800/30 group"
              >
                Executives
                <FiArrowRight className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
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
        <Partners />
      </div>

      <div className="relative">
        <Contact />
      </div>

      <Footer />
    </main>
  );
}
