"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiCheck, FiArrowLeft } from "react-icons/fi";
import { useEffect, useCallback } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

export default function RegistrationSuccess() {
  useEffect(() => {
    document.title = "Registration Successful | FinTech Calgary";
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
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
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: false,
        },
      },
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

        <div className="relative z-10 w-full max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <Link
              href="/"
              className="inline-flex items-center text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-[-4px] mb-8 group"
            >
              <FiArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:translate-x-[-2px]" />
              Back to Home
            </Link>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-700/50 animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <FiCheck className="w-8 h-8 text-primary" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white text-center mb-4">
                Registration Successful!
              </h1>

              <div className="space-y-4 text-center">
                <p className="text-gray-300">
                  Thank you for registering. You will receive a confirmation
                  email shortly.
                </p>
                <p className="text-gray-400 text-sm">
                  If you don&apos;t see the email, please check your spam or
                  junk folder.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
