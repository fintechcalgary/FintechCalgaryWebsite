"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PublicNavbar from "@/components/PublicNavbar";
import * as THREE from "three";
import Link from "next/link";
import AboutUs from "@/components/landing/AboutUs";
import UpcomingEvents from "@/components/landing/UpcomingEvents";
import Footer from "@/components/landing/Footer";
import Contact from "@/components/landing/Contact";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { FiArrowRight } from "react-icons/fi";

export default function Home() {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

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
    if (!vantaEffect && vantaRef.current) {
      import("vanta/dist/vanta.globe.min").then((GLOBE) => {
        setVantaEffect(
          GLOBE.default({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            scale: 1.0,
            scaleMobile: 0.5,
            color: 0x6d28d9,
            backgroundColor: "#121212",
            color2: 0x6d28d9,
            size: 0.7,
            backgroundAlpha: 0.0,
            points: 0,
            maxDistance: 0,
            spacing: 0,
            showDots: false,
            minHeight: 800,
            minWidth: 800,
          })
        );
      });
    }

    const handleScroll = () => {
      const newOpacity = Math.max(0, 1 - window.scrollY / 1000);
      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      if (vantaEffect) vantaEffect.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [vantaEffect]);

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center"></div>

        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />

        <motion.section
          ref={vantaRef}
          className="flex-grow flex items-center justify-center min-h-screen relative"
          style={{ opacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-0"></div>
          <div className="text-center z-10 px-6 max-w-5xl mx-auto">
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
                href="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-full 
                         bg-primary hover:bg-primary/90 text-white transition-all duration-300 
                         hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-1
                         border border-primary/50 hover:border-primary"
              >
                About Us
              </Link>
              <Link
                href="/members"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-full 
                         border border-gray-700 hover:border-primary/50 text-white transition-all duration-300 
                         hover:shadow-xl hover:bg-gray-800/30 backdrop-blur-sm
                         group"
              >
                Members
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
        <UpcomingEvents events={events} />
      </div>

      <div className="relative">
        <Contact />
      </div>

      <Footer />
    </main>
  );
}
