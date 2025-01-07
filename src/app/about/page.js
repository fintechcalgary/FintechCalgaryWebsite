"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

export default function AboutPage() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Using the same particles config as in the info page
  const particlesConfig = {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: "#6d28d9" },
      opacity: { value: 0.8 },
      size: { value: 3 },
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
          enable: true,
          mode: "grab",
        },
      },
    },
    retina_detect: true,
  };

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow">
        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />
        <motion.section className="flex-grow flex items-center justify-center min-h-screen relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-0"></div>
          <div className="container mx-auto px-6 py-24 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                About Fintech Calgary
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Empowering the next generation of financial technology
                innovators
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  Our Vision
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  To become the leading hub for fintech innovation and education
                  in Western Canada, fostering collaboration between students,
                  academics, and industry professionals.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  To educate and empower University of Calgary students with the
                  knowledge and skills needed to thrive in the rapidly evolving
                  financial technology sector.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="md:col-span-2 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  What We Do
                </h2>
                <div className="grid md:grid-cols-3 gap-6 text-gray-300">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Educational Events
                    </h3>
                    <p>
                      Regular workshops, seminars, and hands-on training
                      sessions in various fintech domains.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Industry Connections
                    </h3>
                    <p>
                      Building bridges between students and leading fintech
                      companies through networking events and partnerships.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Innovation Projects
                    </h3>
                    <p>
                      Collaborative projects that solve real-world financial
                      technology challenges.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </main>
  );
}
