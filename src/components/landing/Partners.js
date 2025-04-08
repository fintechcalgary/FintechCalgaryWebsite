import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Partners() {
  const [hoveredPartner, setHoveredPartner] = useState(null);
  const scrollContainerRef = useRef(null);

  // Duplicate partners to create a seamless infinite scroll effect
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

  // Duplicate partners array to create a seamless loop
  const allPartners = [...partners, ...partners, ...partners];

  // Auto-scroll functionality
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let animationId;
    let startTime;
    const duration = 30000; // 30 seconds for one complete scroll
    const totalWidth = scrollContainer.scrollWidth / 3; // Divide by 3 because we tripled the partners

    const scroll = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Calculate position based on elapsed time
      const position = ((elapsed % duration) / duration) * totalWidth;
      scrollContainer.scrollLeft = position;

      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    // Pause animation on hover
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationId);
    };

    const handleMouseLeave = () => {
      startTime = null;
      animationId = requestAnimationFrame(scroll);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      if (scrollContainer) {
        scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
        scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <section id="partners" className="py-24 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[128px] translate-x-1/2 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[96px] -translate-x-1/2 opacity-20"></div>

      <div className="container mx-auto px-6 relative">
        <Link href="/partners">
          <h2 className="text-6xl font-bold mb-20 text-center group cursor-pointer relative">
            <div className="relative inline-block">
              <div
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary 
                         flex items-center justify-center gap-4 group-hover:gap-6 transition-all duration-300"
              >
                Our Partners
              </div>
              <div
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </h2>
        </Link>

        {/* Partners Showcase - Scrolling Carousel - Now more seamless */}
        <div className="max-w-7xl mx-auto">
          {/* Scrolling Partners Container - Made transparent */}
          <div className="relative mb-12 overflow-hidden">
            <div ref={scrollContainerRef} className="overflow-x-hidden py-4">
              <div className="flex gap-16 items-center">
                {allPartners.map((partner, index) => (
                  <div
                    key={`${partner.name}-${index}`}
                    onMouseEnter={() => setHoveredPartner(partner.name)}
                    onMouseLeave={() => setHoveredPartner(null)}
                    className="group relative flex-shrink-0"
                    style={{
                      transition: "transform 0.3s",
                    }}
                  >
                    <div
                      className="backdrop-blur-sm rounded-2xl p-6 w-64 h-48 flex flex-col items-center justify-center
                      border border-gray-700/30 hover:border-primary/50 transition-all duration-300
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
            </div>
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
                className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-medium rounded-full 
                       bg-primary hover:bg-primary/90 text-white transition-all duration-300 
                       hover:shadow-xl hover:shadow-primary/25"
              >
                View All Partners
                <div
                  className="animate-bounce"
                  style={{
                    animation: "none",
                    transform: "translateX(0)",
                  }}
                >
                  <FiArrowRight className="text-xl" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
