"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FiDownload, FiExternalLink, FiArrowRight } from "react-icons/fi";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Image from "next/image";
import Link from "next/link";

export default function PartnersPage() {
  useEffect(() => {
    document.title = "Partners & Sponsors | FinTech Calgary";
  }, []);

  const [hoveredPartner, setHoveredPartner] = useState(null);

  const partners = [
    {
      name: "Dubai FinTech Summit",
      logo: "/partners/dubai-fintech-summit.png",
      description:
        "A premier global event bringing together FinTech innovators, investors, and industry leaders to shape the future of financial technology.",
      website: "https://dubaifintechsummit.com/get-involved/#buy-tickets",
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

        <div className="container mx-auto px-6 py-24 sm:px-8 lg:px-12 relative z-10">
          {/* Page Heading */}
          <div className="text-center mb-20 animate-fadeIn">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Our Partners & Sponsors
            </h1>
            <p className="text-xl text-gray-300/90 max-w-3xl mx-auto">
              We&apos;re proud to collaborate with industry leaders who share
              our vision for innovation in financial technology.
            </p>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
            {partners.map((partner, index) => (
              <div
                key={partner.name}
                onMouseEnter={() => setHoveredPartner(partner.name)}
                onMouseLeave={() => setHoveredPartner(null)}
                className={`group relative overflow-hidden bg-[#12121a]/80 backdrop-blur-xl p-8 rounded-2xl 
                           border border-gray-800 hover:border-primary/50 transition-all duration-500 flex flex-col
                           animate-fadeIn`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Dynamic background gradient on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl z-0 transition-all duration-500
                             ${
                               hoveredPartner === partner.name
                                 ? "opacity-80 scale-110"
                                 : "opacity-0 scale-100"
                             }`}
                  style={{
                    background: `radial-gradient(circle at center, ${partner.color}20 0%, transparent 70%)`,
                  }}
                />

                {/* Logo */}
                <div className="h-40 flex items-center justify-center mb-6 relative z-10">
                  <div className="relative w-full h-32 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={200}
                      height={100}
                      className="object-contain max-h-32 drop-shadow-lg"
                    />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                  {partner.name}
                </h3>
                <p className="text-gray-300/90 mb-6 relative z-10 flex-grow">
                  {partner.description}
                </p>

                {/* Link */}
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-purple-400 transition-colors relative z-10 font-medium"
                >
                  Visit Website <FiArrowRight className="ml-2" />
                </a>
              </div>
            ))}
          </div>

          {/* Sponsorship Package Section */}
          <div className="max-w-4xl mx-auto animate-slideInUp">
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
                  <a
                    href="/FinTech Calgary Sponsorship Package 2025_2026.pdf"
                    download
                    className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white text-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-primary/30"
                  >
                    Download Package
                    <FiDownload className="ml-2" />
                  </a>
                  <a
                    href="/FinTech Calgary Sponsorship Package 2025_2026.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#1e1e2d] hover:bg-[#2a2a3d] text-white text-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-gray-700/30"
                  >
                    View in New Tab
                    <FiExternalLink className="ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div
            className="text-center mt-20 animate-fadeIn"
            style={{ animationDelay: "300ms" }}
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
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
