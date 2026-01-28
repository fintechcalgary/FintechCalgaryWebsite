"use client";

import { useState } from "react";
import {
  FiDownload,
  FiExternalLink,
  FiArrowRight,
  FiChevronDown,
} from "react-icons/fi";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Image from "next/image";
import Link from "next/link";

export default function PartnersPage() {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_PARTNERS_COUNT = 6;
  const partners = [
    {
      name: "University of Calgary",
      logo: "/partners/ucalgary.png",
      description:
        "Our foundational partner and home institution. The University of Calgary provides the academic foundation and support that enables FinTech Calgary to thrive as a leading student organization in financial technology innovation.",
      website:
        "https://suuofc.campuslabs.ca/engage/organization/fintechcalgary",
      color: "#dc2626",
    },
    {
      name: "Dubai FinTech Summit",
      logo: "/partners/dubai-fintech-summit.png",
      description:
        "A premier global event bringing together FinTech innovators, investors, and industry leaders to shape the future of financial technology.",
      website: "https://dubaifintechsummit.com/get-involved/#buy-tickets",
      color: "#14b8a6",
    },
    {
      name: "National Payments",
      logo: "/partners/national-payments.png",
      description:
        "A leading payment solutions provider offering innovative financial technology services to businesses and institutions.",
      website: "https://nationalpayments.ca/",
      color: "#22c55e",
    },
    {
      name: "Trescon",
      logo: "/partners/trescon.png",
      description:
        "A global business events and consulting firm that specializes in producing high-quality B2B events focusing on tech innovation and digital transformation.",
      website: "https://www.tresconglobal.com/",
      color: "#14b8a6",
    },
    {
      name: "Helcim",
      logo: "/partners/helcim.png",
      description:
        "An innovative fintech company offering integrated payment solutions and business tools built for modern commerce.",
      website:
        "https://www.helcim.com/partners/fintechcalgary/?af=3a785c9580a52b",
      color: "#eab308",
    },
    {
      name: "Legal Bridge",
      logo: "/partners/legal-bridge.png",
      description:
        "Legal Bridge is a student-run organization at the University of Calgary aiming to support aspiring law\
        students navigate the journey from undergraduate studies to law school as well as explore new\
        advancements in the legal field.",
      website: "https://www.linkedin.com/company/legal-bridgeuofc/",
      color: "#104ee6",
    },
    {
      name: "UCFSA",
      logo: "/partners/ucfsa.png",
      description:
        "The University of Calgary Filipino Students' Association (UCFSA) is a student-run organization dedicated to celebrating and promoting Filipino culture within the University of Calgary community.",
      website: "https://www.facebook.com/UCFSA/",
      color: "#E8CB47",
    },
    {
      name: "Date with Tech",
      logo: "/partners/date-with-tech.png",
      description:
        "A platform dedicated to exploring emerging technologies and future innovations across industries. It brings together visionaries, business leaders, and technology experts to engage in discussions, showcase advancements, and connect with key players shaping the next wave of technological evolution.",
      website: "https://datewithtech.com/dubai/",
      color: "#00bfff",
    },
    {
      name: "Beyond the Lab",
      logo: "/partners/beyond-the-lab.png",
      description:
        "A student-led club that empowers science and health students to solve real-world healthcare challenges. Our mission is to give students the tools, networks, and experiences they need to become not just future researchers or clinicians, but problem solvers, innovators, and leaders in the health space and beyond!",
      website: "https://beyondthelabclub.wixsite.com/beyond-the-lab",
      color: "#228b22",
    },
    {
      name: "Pakistani Students' Society",
      logo: "/partners/pakistani-students-society.png",
      description:
        "The Pakistani Students' Society is a home away from home. We are a charity organization designed to help out with different non-profits in Pakistan. We pride ourselves on culture, respect and a love for Pakistan.",
      website: "https://www.facebook.com/PakistaniStudentsSocietyUofC/",
      color: "#228b22",
    },
    {
      name: "CeresAI",
      logo: "/partners/ceresai-xyz.png",
      description:
        "An AI companions platform that turns creator expertise into always-on, personalized conversations. CeresAI builds authentic, safe AI companions for creators and brands.",
      website: "https://ceresai.xyz/",
      color: "#4169e1",
    },
    {
      name: "MaxHR",
      logo: "/partners/max-hr.png",
      description:
        "Max is a wholesome work management solution for startups and enterprises seeking to simplify People, Sales, and Finance processes. Our comprehensive, all-in-one work management software simplifies human capital management, supply chain management and accounting all in one place.",
      website: "https://maxhr.io/fintech/",
      color: "#a855f7",
    },
    {
      name: "APIX",
      logo: "/partners/apix.webp",
      description:
        "A Singapore-based cross-border innovation platform that accelerates digital transformation in the financial sector. APIX enables global collaboration between financial institutions, fintechs, and developers through innovation challenges, a digital sandbox, and a marketplace with open API endpoints.",
      website: "https://apixplatform.com/",
      color: "#ec4899",
    },
    {
      name: "Cowboys Dance Hall",
      logo: "/partners/cowboys.png",
      description:
        "Cowboys Dance Hall is one of Calgary's most iconic entertainment destinations, known for bringing together live music and large-scale events in the heart of the city. As an official partner of Fintech, Cowboys leverages innovative payment and financial technology to enhance the guest experience, streamline transactions, and support high-volume event operations.",
      website: "https://www.cowboysnightclub.com/",
      color: "#6d1371",
    },
  ];

  return (
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <div className="relative flex-grow">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {partners.map((partner, index) => {
              const isHidden = !showAll && index >= INITIAL_PARTNERS_COUNT;
              return (
                <div
                  key={partner.name}
                  className={`group relative bg-[#12121a]/80 backdrop-blur-xl rounded-2xl 
                             border border-gray-800 hover:border-primary/50 flex flex-col
                             overflow-hidden transition-all duration-700 ease-in-out ${
                               isHidden ? "hidden" : "p-8 animate-fadeIn"
                             }`}
                  style={{
                    animationDelay: isHidden ? "0ms" : `${index * 100}ms`,
                    "--partner-color": partner.color,
                  }}
                >
                  {/* Dynamic background gradient on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl z-0 transition-all duration-500 opacity-0 scale-100 group-hover:opacity-80 group-hover:scale-110"
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
              );
            })}
          </div>

          {/* Show All Button */}
          {partners.length > INITIAL_PARTNERS_COUNT && (
            <div
              className={`flex justify-center transition-all duration-300 ${
                !showAll ? "mt-8 mb-24" : "mt-12 mb-24"
              }`}
            >
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full 
                         bg-gradient-to-r from-primary/20 to-purple-600/20 backdrop-blur-xl
                         text-white transition-all duration-300 
                         hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-1
                         border border-primary/30 hover:border-primary/50 group hover:scale-105
                         font-medium text-lg"
              >
                {showAll ? (
                  <>
                    Show Less
                    <FiChevronDown className="transform rotate-180 transition-transform duration-300" />
                  </>
                ) : (
                  <>
                    Show All Partners ({partners.length})
                    <FiChevronDown className="transform transition-transform duration-300 group-hover:translate-y-1" />
                  </>
                )}
              </button>
            </div>
          )}

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
