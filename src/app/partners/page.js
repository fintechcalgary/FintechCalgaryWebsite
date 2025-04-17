"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiExternalLink, FiArrowRight } from "react-icons/fi";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Image from "next/image";
import Link from "next/link";
import * as THREE from "three";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-particles";

export default function PartnersPage() {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    document.title = "Partners & Sponsors | FinTech Calgary";
  }, []);

  const [hoveredPartner, setHoveredPartner] = useState(null);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: { value: 10, density: { enable: true, value_area: 800 } },
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
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x6d28d9,
            backgroundColor: 0x1e1b2e,
          })
        );
      });
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const partners = [
    {
      name: "Dubai FinTech Summit",
      logo: "/partners/dubai-fintech-summit.png",
      description:
        "A premier global event bringing together FinTech innovators, investors, and industry leaders to shape the future of financial technology.",
      website: "https://www.dubaifintechsummit.com/",
      color: "#6d28d9",
    },
    {
      name: "National Payments",
      logo: "/partners/national-payments.png",
      description:
        "A leading payment solutions provider offering innovative financial technology services to businesses and institutions.",
      website: "https://nationalpayments.ca/",
      color: "#8b5cf6",
    },
    {
      name: "Trescon",
      logo: "/partners/trescon.png",
      description:
        "A global business events and consulting firm that specializes in producing high-quality B2B events focusing on tech innovation and digital transformation.",
      website: "https://www.tresconglobal.com/",
      color: "#a78bfa",
    },
    {
      name: "Helcim",
      logo: "/partners/helcim.png",
      description:
        "An innovative fintech company offering integrated payment solutions and business tools built for modern commerce.",
      website:
        "https://www.helcim.com/partners/fintechcalgary/?af=3a785c9580a52b",
      color: "#a78bfa",
    },
  ];

  return (
    <main className="flex flex-col min-h-screen bg-[#0a0a0f]">
      <PublicNavbar />

      <div className="relative flex-grow">
        {/* Modern gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f0f19] to-[#13131f] z-0"></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-40 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />

        <div className="container mx-auto px-6 py-24 sm:px-8 lg:px-12 relative z-10">
          {/* Page Heading */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Our Partners & Sponsors
            </h1>
            <p className="text-xl text-gray-300/90 max-w-3xl mx-auto">
              We&apos;re proud to collaborate with industry leaders who share
              our vision for innovation in financial technology.
            </p>
          </motion.div>

          {/* Partners Grid - Modernized */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                onHoverStart={() => setHoveredPartner(partner.name)}
                onHoverEnd={() => setHoveredPartner(null)}
                className="group relative overflow-hidden bg-[#12121a]/80 backdrop-blur-xl p-8 rounded-2xl 
                           border border-gray-800 hover:border-primary/50 transition-all duration-500 flex flex-col"
              >
                {/* Dynamic background gradient on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 rounded-2xl z-0"
                  style={{
                    background: `radial-gradient(circle at center, ${partner.color}20 0%, transparent 70%)`,
                  }}
                  animate={{
                    opacity: hoveredPartner === partner.name ? 0.8 : 0,
                    scale: hoveredPartner === partner.name ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Logo */}
                <div className="h-40 flex items-center justify-center mb-6 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-full h-32 flex items-center justify-center"
                  >
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={200}
                      height={100}
                      className="object-contain max-h-32 drop-shadow-lg"
                    />
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                  {partner.name}
                </h3>
                <p className="text-gray-300/90 mb-6 relative z-10 flex-grow">
                  {partner.description}
                </p>

                {/* Link */}
                <motion.a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-purple-400 transition-colors relative z-10 font-medium"
                  whileHover={{ x: 5 }}
                >
                  Visit Website <FiArrowRight className="ml-2" />
                </motion.a>
              </motion.div>
            ))}
          </div>

          {/* Sponsorship Package Section - Modernized */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative overflow-hidden bg-[#12121a]/80 backdrop-blur-xl p-12 rounded-3xl border border-gray-800">
              {/* Background elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/10 rounded-full blur-[60px]"></div>

              <div className="relative z-10 text-center">
                <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                  Become a Sponsor
                </h2>
                <p className="text-xl text-gray-300/90 mb-8 max-w-2xl mx-auto">
                  Join our mission to innovate the future of finance. Download
                  our sponsorship package to learn about partnership
                  opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="/FinTech Calgary Sponsorship Package 2025_2026.pdf"
                    download
                    className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white text-lg font-medium transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Download Package
                    <FiDownload className="ml-2" />
                  </motion.a>
                  <motion.a
                    href="/FinTech Calgary Sponsorship Package 2025_2026.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#1e1e2d] hover:bg-[#2a2a3d] text-white text-lg font-medium transition-all duration-300 hover:shadow-xl hover:shadow-gray-700/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View in New Tab
                    <FiExternalLink className="ml-2" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact CTA - Modernized */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-20"
          >
            <p className="text-lg text-gray-300/90 mb-4">
              Interested in becoming a partner or sponsor?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center text-primary hover:text-purple-400 font-medium transition-colors"
            >
              Contact us to learn more <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
