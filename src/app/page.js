"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import * as THREE from "three";
import EventCard from "@/components/landing/EventCard";
import Footer from "@/components/landing/Footer";
import Contact from "@/components/landing/Contact";

export default function Home() {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [events, setEvents] = useState([]);

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
    <main className="flex flex-col min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-white">
              Fintech Calgary
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <motion.section
        ref={vantaRef}
        className="flex-grow flex items-center justify-center min-h-screen"
        style={{ opacity }}
      >
        <div className="text-center z-10 px-4">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Fintech Calgary
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Innovating the future of finance at the University of Calgary
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-xl bg-primary hover:bg-primary/80 text-white transition-all duration-200 shadow-lg shadow-primary/25"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <section
        id="about"
        className="py-24 bg-gradient-to-b from-background to-gray-900"
      >
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            About Us
          </motion.h2>
          <motion.p
            className="text-lg mb-4 text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Fintech Calgary is a student-led organization at the University of
            Calgary dedicated to exploring the intersection of finance and
            technology.
          </motion.p>
          <motion.p
            className="text-lg text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Our mission is to educate, innovate, and connect students with
            industry professionals in the rapidly evolving world of financial
            technology.
          </motion.p>
        </div>
      </section>

      <section id="events" className="py-24">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Upcoming Events
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>

      <Contact />

      <Footer />
    </main>
  );
}
