import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Partners() {
  const [hoveredPartner, setHoveredPartner] = useState(null);
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch("/api/partners");
        if (res.ok) {
          const data = await res.json();
          setPartners(data);
        }
      } catch (err) {
        console.error("Failed to fetch partners:", err);
      }
    };
    fetchSponsors();
  }, []);

  return (
    <section id="partners" className="relative py-24">
      <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-purple-500/30 opacity-20 blur-[128px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/30 opacity-20 blur-[96px]" />

      <div className="container relative mx-auto px-6">
        <div className="mb-16 text-center md:mb-20">
          <SectionHeading href="/partners">Our Partners</SectionHeading>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="relative mb-12 h-48 overflow-hidden">
            <div className="absolute flex">
              {[1, 2, 3].map((sectionIndex) => (
                <section
                  key={sectionIndex}
                  className="flex animate-scroll"
                  style={{ "--speed": "60000ms" }}
                >
                  {partners.map((partner, index) => (
                    <div
                      key={`${partner._id || partner.name}-${sectionIndex}-${index}`}
                      onMouseEnter={() => setHoveredPartner(partner.name)}
                      onMouseLeave={() => setHoveredPartner(null)}
                      className="mx-4"
                    >
                      <div className="relative flex h-48 w-64 flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
                        <div
                          className="absolute inset-0 z-0 rounded-2xl"
                          style={{
                            background: `radial-gradient(circle at center, ${partner.color || "#8b5cf6"}20 0%, transparent 70%)`,
                            opacity: hoveredPartner === partner.name ? 0.8 : 0,
                            transform: `scale(${
                              hoveredPartner === partner.name ? 1.2 : 1
                            })`,
                            transition: "opacity 0.5s, transform 0.5s",
                          }}
                        />

                        <div
                          className="relative z-10 flex h-28 w-full items-center justify-center"
                          style={{
                            transform:
                              hoveredPartner === partner.name
                                ? "scale(1.05)"
                                : "scale(1)",
                            transition: "transform 0.3s",
                          }}
                        >
                          {partner.logo ? (
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              width={180}
                              height={90}
                              className="max-h-28 object-contain"
                            />
                          ) : (
                            <span
                              className="text-2xl font-bold text-white/80"
                              style={{ color: partner.color || "#8b5cf6" }}
                            >
                              {(partner.name || "?").charAt(0)}
                            </span>
                          )}
                        </div>

                        <p
                          className="z-10 mt-6 text-center font-medium text-gray-300"
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
                </section>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link href="/partners" className="fc-btn-primary group">
              View All Partners
              <FiArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
