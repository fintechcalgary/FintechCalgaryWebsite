"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

function PartnerCard({ partner }) {
  const color = partner.color || "#8B5CF6";

  return (
    <div className="group relative mx-4 flex h-48 w-64 shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-950/50 p-6 transition-[border-color,box-shadow] duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-25 transition-[opacity,transform] duration-500 group-hover:scale-110 group-hover:opacity-80"
        style={{
          background: `radial-gradient(circle at center, ${color}30 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex h-28 w-full items-center justify-center transition-transform duration-300 group-hover:scale-105">
        {partner.logo ? (
          <Image
            src={partner.logo}
            alt={partner.name}
            width={180}
            height={90}
            loading="lazy"
            sizes="180px"
            className="max-h-28 object-contain"
          />
        ) : (
          <span
            className="fc-title text-2xl text-white/80"
            style={{ color }}
          >
            {(partner.name || "?").charAt(0)}
          </span>
        )}
      </div>

      <p className="fc-title z-10 mt-4 text-center text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-white">
        {partner.name}
      </p>
    </div>
  );
}

export default function Partners() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchSponsors = async () => {
      try {
        const res = await fetch("/api/partners");
        if (res.ok && isMounted) {
          const data = await res.json();
          setPartners(data);
        }
      } catch (err) {
        console.error("Failed to fetch partners:", err);
      }
    };
    fetchSponsors();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderCards = (suffix) =>
    partners.map((partner, index) => (
      <PartnerCard
        key={`${suffix}-${partner._id || partner.name}-${index}`}
        partner={partner}
      />
    ));

  return (
    <section id="partners" className="relative overflow-x-clip py-24">
      <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-purple-500/30 opacity-20 blur-[128px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/30 opacity-20 blur-[96px]" />

      <div className="container relative mx-auto px-6">
        <div className="mb-16 text-center md:mb-20">
          <SectionHeading href="/partners">Our Partners</SectionHeading>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="relative mb-12 h-48 overflow-hidden">
            {partners.length > 0 ? (
              <div
                className="absolute flex w-max will-change-transform animate-scroll hover:[animation-play-state:paused] motion-reduce:animate-none"
                style={{ "--speed": "50s" }}
              >
                <div className="flex">{renderCards("a")}</div>
                <div className="flex" aria-hidden="true">
                  {renderCards("b")}
                </div>
              </div>
            ) : null}
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
