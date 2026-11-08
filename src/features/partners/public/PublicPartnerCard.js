"use client";

import Image from "next/image";
import { GlowCard } from "@/components/ui/spotlight-card";

const DEFAULT_COLOR = "#8B5CF6";

const CARD_HEIGHT_CLASS = "h-[24rem]";

const CARD_GRID_CLASS =
  "grid min-h-0 w-full grid-cols-1 grid-rows-[8rem_auto_minmax(0,1fr)_2.5rem] gap-y-0 overflow-hidden";

const LOGO_MAX_CLASS =
  "max-h-[5.75rem] w-full max-w-[15rem] object-contain sm:max-h-[6rem] sm:max-w-[16rem]";

export default function PublicPartnerCard({ partner, onSelect }) {
  const color = partner.color || DEFAULT_COLOR;
  const description = partner.description || "";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(partner)}
      className={`group w-full cursor-pointer overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 rounded-2xl ${CARD_HEIGHT_CLASS}`}
      aria-label={`View details for ${partner.name}`}
    >
      <GlowCard
        customSize
        color={color}
        className={`relative !gap-0 !p-6 transition-transform duration-300 group-hover:scale-[1.01] group-active:scale-[0.99] ${CARD_HEIGHT_CLASS}`}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 scale-100 rounded-2xl opacity-0 transition-all duration-500 group-hover:scale-110 group-hover:opacity-80"
          style={{
            background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
          }}
        />

        <div className={`relative z-10 h-full min-h-0 w-full ${CARD_GRID_CLASS}`}>
        <div className="mb-3 flex min-h-0 items-center justify-center px-2 sm:mb-4">
          {partner.logo ? (
            <Image
              src={partner.logo}
              alt=""
              width={256}
              height={128}
              className={`${LOGO_MAX_CLASS} drop-shadow-lg`}
            />
          ) : (
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white/80"
              style={{ backgroundColor: `${color}30` }}
            >
              {(partner.name || "?").charAt(0)}
            </div>
          )}
        </div>

        <h3 className="mb-1.5 min-h-0 overflow-hidden text-xl leading-snug line-clamp-2 sm:text-2xl">
          {partner.name}
        </h3>

        <div className="h-full min-h-0 overflow-hidden">
          <p className="m-0 h-full overflow-hidden break-words leading-relaxed">
            {description}
          </p>
        </div>

        <span className="flex h-10 items-center pt-2 text-sm font-medium text-primary/90 group-hover:text-primary">
          View details
        </span>
        </div>
      </GlowCard>
    </button>
  );
}
