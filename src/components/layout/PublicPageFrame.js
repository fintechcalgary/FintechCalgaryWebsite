"use client";

import { PageHeading } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";

/** Shared public-page gutter: clears the fixed navbar and matches side padding. */
export const PUBLIC_PAGE_GUTTER =
  "container relative z-10 mx-auto px-6 pb-24 pt-36 sm:px-8 lg:px-12";

export const PUBLIC_TITLE_SIZE = "text-3xl sm:text-4xl md:text-5xl mb-6";

export const PUBLIC_GLOW_CARD =
  "w-full !gap-0 !p-6 sm:!p-8";

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

export function PublicPageFrame({ children, className = "" }) {
  return (
    <div className="relative flex-grow">
      <div className={`${PUBLIC_PAGE_GUTTER} ${className}`.trim()}>
        {children}
      </div>
    </div>
  );
}

export function PublicPageHeader({ title, lede, children, className = "" }) {
  return (
    <div className={`mb-16 animate-fadeIn text-center ${className}`.trim()}>
      <PageHeading sizeClass={PUBLIC_TITLE_SIZE}>{title}</PageHeading>
      {lede ? (
        <p className="text-lede mx-auto max-w-3xl">{lede}</p>
      ) : null}
      {children}
    </div>
  );
}

export function PublicPageMetaLine({ children, className = "" }) {
  return <p className={`text-muted ${className}`.trim()}>{children}</p>;
}

export function PublicPageMetaDot() {
  return (
    <span className="mx-2.5 text-white/20" aria-hidden>
      ·
    </span>
  );
}
