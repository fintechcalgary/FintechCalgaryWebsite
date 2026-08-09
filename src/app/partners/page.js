"use client";

import { useState, useEffect } from "react";
import {
  FiDownload,
  FiExternalLink,
  FiArrowRight,
  FiChevronDown,
} from "react-icons/fi";
import PublicPageShell from "@/components/layout/PublicPageShell";
import Spinner from "@/components/ui/Spinner";
import { PageTitle } from "@/components/ui/SectionHeading";
import Image from "next/image";
import Link from "next/link";

export default function PartnersPage() {
  const [showAll, setShowAll] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const INITIAL_PARTNERS_COUNT = 6;

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
      } finally {
        setLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  return (
    <PublicPageShell title="Partners | FinTech Calgary">
      <div className="relative flex-grow">
        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 sm:px-8 lg:px-12">
          <div className="mb-20 animate-fadeIn text-center">
            <PageTitle
              sizeClass="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
            >
              Our Partners & Sponsors
            </PageTitle>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Companies and campus groups we work with on events, sponsorships,
              and student projects.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              <div className="mx-auto mb-12 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
                {partners.map((partner, index) => {
                  const isHidden = !showAll && index >= INITIAL_PARTNERS_COUNT;
                  return (
                    <div
                      key={partner._id || partner.name}
                      className={`fc-card group relative flex flex-col overflow-hidden ${
                        isHidden ? "hidden" : "animate-fadeIn p-8"
                      }`}
                      style={{
                        animationDelay: isHidden ? "0ms" : `${index * 100}ms`,
                        "--partner-color": partner.color,
                      }}
                    >
                      <div
                        className="absolute inset-0 z-0 rounded-2xl scale-100 opacity-0 transition-all duration-500 group-hover:scale-110 group-hover:opacity-80"
                        style={{
                          background: `radial-gradient(circle at center, ${partner.color}20 0%, transparent 70%)`,
                        }}
                      />

                      <div className="relative z-10 mb-6 flex h-40 items-center justify-center">
                        <div className="relative flex h-32 w-full items-center justify-center transition-transform duration-300 hover:scale-105">
                          {partner.logo ? (
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              width={200}
                              height={100}
                              className="max-h-32 object-contain drop-shadow-lg"
                            />
                          ) : (
                            <div
                              className="flex h-24 w-24 items-center justify-center rounded-xl text-2xl font-bold text-white/80"
                              style={{
                                backgroundColor: `${partner.color || "#8b5cf6"}30`,
                              }}
                            >
                              {(partner.name || "?").charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="relative z-10 mb-4 text-2xl font-bold text-white">
                        {partner.name}
                      </h3>
                      <p className="relative z-10 mb-6 flex-grow text-gray-300">
                        {partner.description}
                      </p>

                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="fc-link relative z-10 inline-flex items-center font-medium"
                        >
                          Visit Website <FiArrowRight className="ml-2" />
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {partners.length > INITIAL_PARTNERS_COUNT && (
                <div
                  className={`flex justify-center transition-all duration-300 ${
                    !showAll ? "mb-24 mt-8" : "mb-24 mt-12"
                  }`}
                >
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="fc-btn-soft group"
                  >
                    {showAll ? (
                      <>
                        Show Less
                        <FiChevronDown className="rotate-180 transform transition-transform duration-300" />
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
            </>
          )}

          <div className="mx-auto max-w-4xl animate-slideInUp">
            <div className="fc-card relative overflow-hidden p-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-600/10 blur-[60px]" />

              <div className="relative z-10 text-center">
                <h2 className="mb-6 bg-gradient-to-r from-primary to-purple-400/75 bg-clip-text text-4xl font-bold text-transparent">
                  Become a Sponsor
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
                  Sponsorship supports our events and student programs. Download
                  the package for tiers and benefits.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <a
                    href="/FinTech Calgary Sponsorship Package 2025_2026.pdf"
                    download
                    className="fc-btn-primary"
                  >
                    Download Package
                    <FiDownload />
                  </a>
                  <a
                    href="/FinTech Calgary Sponsorship Package 2025_2026.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fc-btn-secondary"
                  >
                    View in New Tab
                    <FiExternalLink />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-20 animate-fadeIn text-center"
            style={{ animationDelay: "300ms" }}
          >
            <p className="mb-4 text-lg text-gray-300">
              Interested in becoming a partner or sponsor?
            </p>
            <Link
              href="/contact"
              className="fc-link inline-flex items-center font-medium"
            >
              Contact us to learn more <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
