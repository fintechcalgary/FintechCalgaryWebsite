"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
import Image from "next/image";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [opacity, setOpacity] = useState(
    useTransform(scrollYProgress, [0, 0.5], [1, 0])
  );

  const [events, setEvents] = useState([]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 200;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    document.title = "Home | FinTech Calgary";
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

  const particlesConfig = {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 1200 } },
      color: { value: "#8b5cf6" },
      opacity: { value: 0.8 },
      size: { value: 2 },
      move: { enable: true, speed: 0.8, random: true, out_mode: "out" },
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "grab" } },
    },
    retina_detect: true,
  };

  useEffect(() => {
    const handleScroll = () => {
      const newOpacity = Math.max(0, 1 - window.scrollY / 1000);
      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900 overflow-hidden">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-primary/40 max-md:bg-primary/30 rounded-full blur-[128px] -translate-x-1/2"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-500/40 max-md:bg-purple-500/20 rounded-full blur-[96px] translate-x-1/2"></div>
        {/* <div className="absolute bottom-0 right-1/2 w-[600px] h-[600px] bg-violet-600/30 max-md:hidden rounded-full blur-[128px] -translate-y-1/2"></div> */}

        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />

        <motion.section
          className="flex-grow flex items-center justify-center min-h-screen relative overflow-visible"
          style={{ opacity }}
        >
          <div className="absolute inset-0 overflow-visible">
            <Image
              src="/globe.svg"
              alt="Globe"
              width={500}
              height={500}
              className="absolute min-w-[100vw] min-h-[100vh] top-32 -right-32 max-md:min-w-[200vw] max-md:min-h-[200vh] max-md:-top-64 animate-rock"
            />
          </div>
          {/* <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background z-0"></div> */}
          <div className="text-center z-10 px-6 max-w-5xl mx-auto relative">
            <motion.h1
              className="text-7xl xl:text-8xl mb-2 bg-clip-text text-transparent py-6 bg-gradient-to-r from-primary via-purple-400 to-pink-500 font-black"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              FinTech Calgary
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl xl:text-3xl mb-12 text-gray-200 font-light leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Innovating the future of finance at the University of Calgary
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0 max-w-[280px] sm:max-w-none mx-auto"
            >
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
                         hover:shadow-xl hover:bg-gray-800/30 backdrop-blur-sm
                         group"
              >
                Executives
                <FiArrowRight className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </motion.section>
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
        <Contact />
      </div>

      <Footer />
    </main>
  );
}
