"use client";

import { PageTitle } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";

/** Shared public-page gutter: clears the fixed navbar and matches side padding. */
export const PUBLIC_PAGE_GUTTER =
  "container relative z-10 mx-auto px-6 pb-24 pt-36 sm:px-8 lg:px-12";

export const PUBLIC_TITLE_SIZE = "text-3xl sm:text-4xl md:text-5xl mb-6";

/** Standard GlowCard shell on marketing / insights pages */
export const PUBLIC_GLOW_CARD =
  "w-full !gap-0 !p-6 sm:!p-8";

/** Section headings inside GlowCard panels */
export const PUBLIC_SECTION_TITLE =
  "fc-title-accent relative z-10 mb-4 text-xl sm:mb-5 sm:text-2xl";

export const PUBLIC_SECTION_TITLE_INLINE =
  "fc-title-accent relative z-10 mb-0 text-xl sm:text-2xl";

export const PUBLIC_SECTION_TITLE_SM =
  "fc-title-accent relative z-10 mb-3 text-lg sm:mb-4";

export function PublicGlowCard({ className = "", children, ...props }) {
  return (
    <GlowCard
      customSize
      glowColor="purple"
      className={`${PUBLIC_GLOW_CARD} ${className}`.trim()}
      {...props}
    >
      {children}
    </GlowCard>
  );
}

/**
 * Standard public page column under the navbar.
 */
export function PublicPageFrame({ children, className = "" }) {
  return (
    <div className="relative flex-grow">
      <div className={`${PUBLIC_PAGE_GUTTER} ${className}`.trim()}>
        {children}
      </div>
    </div>
  );
}

/**
 * Centered page title and intro used on marketing routes.
 * Extra nodes render under the lede (filters, meta lines).
 */
export function PublicPageHeader({ title, lede, children, className = "" }) {
  return (
    <div className={`mb-16 animate-fadeIn text-center ${className}`.trim()}>
      <PageTitle sizeClass={PUBLIC_TITLE_SIZE}>{title}</PageTitle>
      {lede ? <p className="fc-lede mx-auto max-w-3xl">{lede}</p> : null}
      {children}
    </div>
  );
}

/** Muted meta row with middle-dot separators (e.g. "Updated daily · Last refresh …"). */
export function PublicPageMetaLine({ children, className = "" }) {
  return (
    <p className={`fc-muted ${className}`.trim()}>{children}</p>
  );
}

export function PublicPageMetaDot() {
  return (
    <span className="mx-2.5 text-white/20" aria-hidden>
      ·
    </span>
  );
}
