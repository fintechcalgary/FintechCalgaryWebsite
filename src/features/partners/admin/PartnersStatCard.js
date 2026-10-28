"use client";

import { GlowCard } from "@/components/ui/spotlight-card";

export default function PartnersStatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
}) {
  const accents = {
    primary: { glow: "purple" },
    yellow: { glow: "purple" },
    green: { glow: "purple" },
  };
  const styles = accents[accent] || accents.primary;

  return (
    <GlowCard
      customSize
      glowColor={styles.glow}
      className="w-full !gap-0 !p-4 sm:!p-6"
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="min-w-0 space-y-1">
          <p className="fc-muted">{label}</p>
          <p className="text-2xl font-bold text-white sm:text-3xl">{value}</p>
        </div>
        <span className="fc-icon">
          <Icon className="text-xl sm:text-2xl" />
        </span>
      </div>
    </GlowCard>
  );
}
