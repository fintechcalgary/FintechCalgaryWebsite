"use client";
import { linkAccent, titleAccent } from "@/lib/uiClassNames";
import { BTN_MARKETING_PRIMARY_CLASS, BTN_MARKETING_SECONDARY_CLASS, BTN_MARKETING_SOFT_CLASS } from "@/lib/uiTokens";

import { useState, useEffect } from "react";
import {
  FiDownload,
  FiExternalLink,
  FiArrowRight,
  FiChevronDown,
} from "react-icons/fi";
import PublicPageShell from "@/components/layout/PublicPageShell";
import Spinner from "@/components/ui/Spinner";
import { PublicPageFrame, PublicPageHeader } from "@/components/layout/PublicPageFrame";
import { GlowCard } from "@/components/ui/spotlight-card";
import Link from "next/link";
import PublicPartnerCard from "@/features/partners/public/PublicPartnerCard";
import PartnerDetailModal from "@/features/partners/public/PartnerDetailModal";
import { API_ENDPOINTS } from "@/lib/constants";

export default function PartnersPage() {
  const [showAll, setShowAll] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const INITIAL_PARTNERS_COUNT = 6;

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.PARTNER);
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
      <PublicPageFrame>
          <PublicPageHeader
            title="Our Partners & Sponsors"
            lede="Companies and campus groups we work with on events, sponsorships, and student projects."
          />

          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              <div className="mx-auto mb-12 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
                {partners.map((partner, index) => {
                  const isHidden = !showAll && index >= INITIAL_PARTNERS_COUNT;
                  if (isHidden) return null;
                  return (
                    <div
                      key={partner._id || partner.name}
                      className="flex h-full animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <PublicPartnerCard
                        partner={partner}
                        onSelect={setSelectedPartner}
                      />
                    </div>
                  );
                })}
              </div>

              <PartnerDetailModal
                partner={selectedPartner}
                isOpen={Boolean(selectedPartner)}
                onClose={() => setSelectedPartner(null)}
              />

              {partners.length > INITIAL_PARTNERS_COUNT && (
                <div
                  className={`flex justify-center transition-all duration-300 ${
                    !showAll ? "mb-24 mt-8" : "mb-24 mt-12"
                  }`}
                >
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className={`${BTN_MARKETING_SOFT_CLASS} group`.trim()}
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
            <GlowCard
              customSize
              glowColor="purple"
              className="relative w-full !gap-0 !p-12"
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-600/10 blur-[60px]" />

              <div className="relative z-10 text-center">
                <h2 className={`${titleAccent} mb-6 text-2xl`.trim()}>
                  Become a Sponsor
                </h2>
                <p className="text-lede mx-auto mb-8 max-w-2xl">
                  Sponsorship supports our events and student programs. Download
                  the package for tiers and benefits.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <a
                    href="/FinTech Calgary Sponsorship Package 2025_2026.pdf"
                    download
                    className={BTN_MARKETING_PRIMARY_CLASS}
                  >
                    Download Package
                    <FiDownload />
                  </a>
                  <a
                    href="/FinTech Calgary Sponsorship Package 2025_2026.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={BTN_MARKETING_SECONDARY_CLASS}
                  >
                    View in New Tab
                    <FiExternalLink />
                  </a>
                </div>
              </div>
            </GlowCard>
          </div>

          <div
            className="mt-20 animate-fadeIn text-center"
            style={{ animationDelay: "300ms" }}
          >
            <p className="text-lede mb-4">
              Interested in becoming a partner or sponsor?
            </p>
            <Link
              href="/contact"
              className={`${linkAccent} inline-flex items-center`.trim()}
            >
              Contact us to learn more <FiArrowRight className="ml-2" />
            </Link>
          </div>
      </PublicPageFrame>
    </PublicPageShell>
  );
}
