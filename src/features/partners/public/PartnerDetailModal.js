"use client";

import Image from "next/image";
import { FiExternalLink } from "react-icons/fi";
import ContentModal from "@/components/ui/Modal/ContentModal";
import { BTN_MARKETING_PRIMARY_CLASS } from "@/lib/uiTokens";

const DEFAULT_COLOR = "#8B5CF6";

export default function PartnerDetailModal({ partner, isOpen, onClose }) {
  if (!partner) return null;

  const color = partner.color || DEFAULT_COLOR;
  const website = partner.website?.trim();

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      title={partner.name}
      size="md"
      footer={
        website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_MARKETING_PRIMARY_CLASS} w-full justify-center sm:w-auto`}
          >
            Visit Website
            <FiExternalLink className="h-4 w-4" />
          </a>
        ) : null
      }
    >
      <div className="space-y-6 p-6 sm:p-8">
        <div className="flex h-32 items-center justify-center">
          {partner.logo ? (
            <Image
              src={partner.logo}
              alt=""
              width={240}
              height={120}
              className="max-h-28 w-auto object-contain"
            />
          ) : (
            <span
              className="font-display text-4xl font-bold text-white/80"
              style={{ color }}
            >
              {(partner.name || "?").charAt(0)}
            </span>
          )}
        </div>

        <p className="text-body-lg whitespace-pre-wrap">
          {partner.description || "No description available."}
        </p>
      </div>
    </ContentModal>
  );
}
