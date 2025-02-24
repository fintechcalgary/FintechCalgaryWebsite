"use client";

import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 - Page Not Found | FinTech Calgary";
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
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

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow flex items-center justify-center">
        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />

        <div className="relative z-10 container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-8xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
              404
            </h1>
            <h2 className="text-3xl font-semibold text-white mb-6">
              Page Not Found
            </h2>
            <p className="text-gray-300 text-lg mb-12">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-primary hover:bg-primary/80 rounded-xl transition-all duration-200 group"
            >
              <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
