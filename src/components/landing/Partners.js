import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import { useState } from "react";

export default function Partners() {
  const [hoveredPartner, setHoveredPartner] = useState(null);

  const partners = [
    {
      name: "Dubai FinTech Summit",
      logo: "/partners/dubai-fintech-summit.png",
      color: "#6d28d9",
    },
    {
      name: "National Payments",
      logo: "/partners/national-payments.png",
      color: "#8b5cf6",
    },
    {
      name: "Trescon",
      logo: "/partners/trescon.png",
      color: "#a78bfa",
    },
  ];

  return (
    <section id="partners" className="py-24 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[128px] translate-x-1/2 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[96px] -translate-x-1/2 opacity-20"></div>

      <div className="container mx-auto px-6 relative">
        {/* Title */}
        <h2 className="text-6xl font-bold mb-20 text-center">
          <Link href="/partners" className="group inline-block relative">
            <div className="flex items-center justify-center gap-4 hover:gap-6 transition-all duration-300">
              <div className="relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary">
                  Our Partners
                </span>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-primary to-purple-500 rounded-full"></div>
              </div>
            </div>
          </Link>
        </h2>

        {/* Partners Showcase - Modernized */}
        <div className="max-w-6xl mx-auto">
          <div
            className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-3xl p-10 lg:p-12 
            shadow-xl border border-gray-700/50 backdrop-blur-xl"
          >
            <p className="text-lg text-gray-300 leading-relaxed mb-12 text-center max-w-3xl mx-auto">
              We&apos;re proud to collaborate with industry leaders who share
              our vision for innovation in financial technology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {partners.map((partner, index) => (
                <div
                  key={partner.name}
                  onMouseEnter={() => setHoveredPartner(partner.name)}
                  onMouseLeave={() => setHoveredPartner(null)}
                  className="group relative"
                  style={{
                    opacity: 1,
                    transform: "translateY(0)",
                    transition: "opacity 0.3s, transform 0.3s",
                  }}
                >
                  <div
                    className="bg-[#12121a]/80 backdrop-blur-xl rounded-2xl p-6 w-full h-48 flex flex-col items-center justify-center
                    border border-gray-700/50 hover:border-primary/50 transition-all duration-300
                    hover:shadow-lg hover:shadow-primary/20 overflow-hidden"
                  >
                    {/* Dynamic background gradient on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl z-0"
                      style={{
                        background: `radial-gradient(circle at center, ${partner.color}20 0%, transparent 70%)`,
                        opacity: hoveredPartner === partner.name ? 0.8 : 0,
                        transform: `scale(${
                          hoveredPartner === partner.name ? 1.2 : 1
                        })`,
                        transition: "opacity 0.5s, transform 0.5s",
                      }}
                    />

                    <div
                      className="relative w-full h-28 flex items-center justify-center z-10"
                      style={{
                        transform:
                          hoveredPartner === partner.name
                            ? "scale(1.05)"
                            : "scale(1)",
                        transition: "transform 0.3s",
                      }}
                    >
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={180}
                        height={90}
                        className="object-contain max-h-28"
                      />
                    </div>

                    <p
                      className="mt-6 text-gray-300 text-center font-medium z-10"
                      style={{
                        color:
                          hoveredPartner === partner.name
                            ? "#ffffff"
                            : "#d1d5db",
                        transition: "color 0.3s",
                      }}
                    >
                      {partner.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div
                className="inline-block"
                style={{
                  transform: "scale(1)",
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.95)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
              >
                <Link
                  href="/partners"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary/90 to-purple-500/90 
                    text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 group"
                >
                  <span>View All Partners</span>
                  <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
