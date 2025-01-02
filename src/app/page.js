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
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <nav className="fixed top-0 w-full z-50 bg-gray-900/30 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <motion.img
                src="/logo.svg"
                alt="Dimension Logo"
                className="w-16 h-16"
                whileHover={{ scale: 1.1 }}
              />
            </Link>
            <div className="flex items-center gap-8">
              <Link
                href="/login"
                className="text-gray-200 hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-primary/90 hover:bg-primary text-white px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

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

      <section id="about" className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            About Us
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              className="p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                Our Mission
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Fintech Calgary is a student-led organization at the University
                of Calgary dedicated to exploring the intersection of finance
                and technology.
              </p>
            </motion.div>
            <motion.div
              className="p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                What We Do
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Our mission is to educate, innovate, and connect students with
                industry professionals in the rapidly evolving world of
                financial technology.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="events" className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-5xl font-bold mb-8 py-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Upcoming Events
          </motion.h2>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {events.map((event, index) => (
                <EventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <p className="text-2xl text-gray-400 mb-3">
                No events scheduled yet
              </p>
              <p className="text-gray-500">
                Stay tuned for exciting upcoming events and opportunities!
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <Contact />
      <Footer />
    </main>
  );
}
