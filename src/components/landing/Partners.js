import Link from "next/link";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Partners() {
  const [hoveredPartner, setHoveredPartner] = useState(null);
  const scrollContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
    {
      name: "Helcim",
      logo: "/partners/helcim.png",
      color: "#a78bfa",
    },
  ];

  // Duplicate partners array to create a seamless loop
  const allPartners = [...partners, ...partners, ...partners];

  // Mobile navigation functions
  const nextMobilePartner = (e) => {
    e.preventDefault();
    setCurrentMobileIndex((prev) => (prev + 1) % partners.length);
  };

  const prevMobilePartner = (e) => {
    e.preventDefault();
    setCurrentMobileIndex(
      (prev) => (prev - 1 + partners.length) % partners.length
    );
  };

  // Auto-scroll functionality
  useEffect(() => {
    // Skip animation setup on mobile
    if (isMobile) return;

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
  }, [isMobile]);

  // Create a circular array for mobile view to show previous, current, and next partners
  const getMobilePartners = () => {
    const prev = (currentMobileIndex - 1 + partners.length) % partners.length;
    const next = (currentMobileIndex + 1) % partners.length;
    return [partners[prev], partners[currentMobileIndex], partners[next]];
  };

  return (
    <section id="partners" className="py-24 relative">
      {/* Background Elements */}
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

        <div className="max-w-7xl mx-auto">
          {/* Partners Showcase - Scrolling on desktop, carousel on mobile */}
          <div className="relative mb-12 overflow-hidden">
            {isMobile ? (
              // Mobile carousel with previews
              <div className="relative py-4">
                <div className="flex items-center justify-center">
                  {/* Navigation arrows */}
                  <button
                    onClick={prevMobilePartner}
                    className="absolute left-0 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                    aria-label="Previous partner"
                  >
                    <FiChevronLeft size={24} />
                  </button>

                  {/* Partners carousel */}
                  <div className="flex items-center justify-center w-full overflow-hidden">
                    {getMobilePartners().map((partner, index) => {
                      // 0 = previous, 1 = current, 2 = next
                      const isCenter = index === 1;

                      return (
                        <div
                          key={`${partner.name}-${index}`}
                          className={`transition-all duration-300 transform ${
                            isCenter
                              ? "scale-100 z-10 opacity-100"
                              : "scale-75 opacity-40"
                          } ${
                            index === 0
                              ? "-mr-10 relative left-5"
                              : index === 2
                              ? "-ml-10 relative right-5"
                              : ""
                          }`}
                        >
                          <div
                            onMouseEnter={() =>
                              isCenter && setHoveredPartner(partner.name)
                            }
                            onMouseLeave={() =>
                              isCenter && setHoveredPartner(null)
                            }
                            className="group relative mx-auto"
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
                                  opacity:
                                    isCenter && hoveredPartner === partner.name
                                      ? 0.8
                                      : 0,
                                  transform: `scale(${
                                    isCenter && hoveredPartner === partner.name
                                      ? 1.2
                                      : 1
                                  })`,
                                  transition: "opacity 0.5s, transform 0.5s",
                                }}
                              />

                              <div
                                className="relative w-full h-28 flex items-center justify-center z-10"
                                style={{
                                  transform:
                                    isCenter && hoveredPartner === partner.name
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
                                    isCenter && hoveredPartner === partner.name
                                      ? "#ffffff"
                                      : "#d1d5db",
                                  transition: "color 0.3s",
                                }}
                              >
                                {partner.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={nextMobilePartner}
                    className="absolute right-0 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                    aria-label="Next partner"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </div>

                {/* Indicator dots */}
                <div className="flex justify-center mt-6 gap-2">
                  {partners.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentMobileIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentMobileIndex
                          ? "bg-primary w-6"
                          : "bg-gray-500 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to partner ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Scrolling container for desktop
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
            )}
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
