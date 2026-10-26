"use client";

import { useState } from "react";
import Link from "next/link";
import { GlowCard } from "@/components/ui/spotlight-card";

const glowByColor = {
  purple: "purple",
  orange: "pink",
  green: "purple",
  blue: "pink",
  red: "pink",
  pink: "pink",
};

const iconWrapByGlow = {
  purple: {
    wrap: "border-primary/30 bg-gradient-to-br from-primary/20 to-primary/30",
    icon: "text-primary",
  },
  pink: {
    wrap: "border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500/15 to-violet-500/20",
    icon: "text-fuchsia-300",
  },
};

/**
 * Dashboard navigation card used on the admin home grid.
 */
export default function AdminCard({ title, description, icon: Icon, href, color }) {
  const [isHovered, setIsHovered] = useState(false);
  const glowColor = glowByColor[color] || "purple";
  const iconStyles = iconWrapByGlow[glowColor] || iconWrapByGlow.purple;

  return (
    <Link
      href={href}
      className="group block h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GlowCard
        customSize
        glowColor={glowColor}
        className="h-full w-full !p-6 !gap-0 transition-transform duration-500 group-hover:scale-[1.02]"
      >
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="fc-title text-lg transition-all duration-300"
              style={{
                transform: isHovered ? "translateY(-2px)" : "translateY(0)",
              }}
            >
              {title}
            </h3>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 ${iconStyles.wrap} ${
                isHovered ? "scale-110 shadow-lg shadow-primary/15" : ""
              }`}
            >
              <Icon className={`h-5 w-5 ${iconStyles.icon}`} />
            </div>
          </div>
          <p
            className="mb-4 flex-grow fc-body transition-all duration-300"
            style={{
              opacity: isHovered ? 1 : 0.8,
            }}
          >
            {description}
          </p>
          <div className="mt-auto flex justify-end">
            <div className="text-primary transition-transform duration-300 group-hover:translate-x-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}
