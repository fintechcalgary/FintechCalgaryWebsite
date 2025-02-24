"use client";

import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About | FinTech Calgary";
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Using the same particles config as in the info page
  const particlesConfig = {
    particles: {
      number: { value: 30, density: { enable: true, value_area: 800 } },
      color: { value: "#6d28d9" },
      opacity: { value: 0.5 },
      size: { value: 2 },
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
        <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center"></div>
        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />
        <motion.section className="flex-grow flex items-center justify-center min-h-screen relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-0"></div>
          <div className="container mx-auto px-6 py-32 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <div className="relative inline-block">
                <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
                  About Us
                </h1>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
              </div>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto mt-16 leading-relaxed">
                Welcome to FinTech Calgary!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h2 className="text-3xl font-bold text-primary mb-6 relative">
                  Who We Are
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg relative">
                  We&apos;re more than just a community; we&apos;re a dynamic
                  hub where passion meets innovation at the intersection of
                  finance and technology. Our members are at the forefront of
                  understanding, discussing, and harnessing the transformative
                  power of FinTech. We&apos;ve established ourselves as a
                  platform where professionals, students and enthusiasts within
                  the FinTech space build valuable connections, exchange ideas
                  and collaborate on projects and competitions that shape the
                  future of finance.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h2 className="text-3xl font-bold text-primary mb-6 relative">
                  What We Do
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg relative">
                  Our commitment extends beyond networking. We&apos;re dedicated
                  to fostering entrepreneurship by providing resources, guidance
                  and platforms like pitch competitions and hackathons.
                  Moreover, our seminars, workshops, and webinars serve as bases
                  of knowledge, highlighting the latest trends and developments
                  in FinTech, including digital banking, blockchain, crypto and
                  more.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="md:col-span-2 group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-10 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h2 className="text-3xl font-bold text-primary mb-6 relative">
                  Our Community
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg relative">
                  FinTech Calgary isn&apos;t just a club; it&apos;s a vibrant
                  community that bridges the gap between finance and technology,
                  fostering innovation and collaboration every step of the way.
                  We explore and navigate the technological world of finance,
                  promoting the growth and development of FinTech initiatives
                  and businesses together. Welcome to the future of Finance.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </main>
  );
}
