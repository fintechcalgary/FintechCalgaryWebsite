"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import * as THREE from "three";
import AboutUs from "@/components/landing/AboutUs";
import UpcomingEvents from "@/components/landing/UpcomingEvents";
import Footer from "@/components/landing/Footer";
import Contact from "@/components/landing/Contact";
import PublicNavbar from "@/components/PublicNavbar";
export default function Home() {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.slice(0, 4)); // Only show first 4 events
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!vantaEffect) {
      import("vanta/dist/vanta.globe.min").then((GLOBE) => {
        setVantaEffect(
          GLOBE.default({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x9900ff,
            backgroundColor: 0x120724,
          })
        );
      });
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <motion.section
        ref={vantaRef}
        className="flex-grow flex items-center justify-center min-h-screen relative"
        style={{ opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-0"></div>
        <div className="text-center z-10 px-4 max-w-4xl mx-auto">
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-2 bg-clip-text text-transparent py-6 bg-gradient-to-r from-primary via-purple-400 to-pink-500"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Fintech Calgary
          </motion.h1>
          <motion.p
            className="text-xl md:text-3xl mb-12 text-gray-200 font-light"
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
            className="space-x-6"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full bg-primary hover:bg-primary/90 text-white transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-1"
            >
              Get Started
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full border border-gray-700 hover:border-primary/50 text-white transition-all duration-300 hover:shadow-xl hover:bg-gray-800/30"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <AboutUs />
      <UpcomingEvents events={events} />
      <Contact />
      <Footer />
    </main>
  );
}
