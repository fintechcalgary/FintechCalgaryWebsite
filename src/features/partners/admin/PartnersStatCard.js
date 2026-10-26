"use client";

import { GlowCard } from "@/components/ui/spotlight-card";

export default function PartnersStatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
}) {
  const accents = {
    primary: {
      glow: "purple",
      iconWrap: "bg-primary/20 border-primary/30",
      icon: "text-primary",
    },
    yellow: {
      glow: "purple",
      iconWrap: "bg-yellow-500/20 border-yellow-500/30",
      icon: "text-yellow-500",
    },
    green: {
      glow: "purple",
      iconWrap: "bg-green-500/20 border-green-500/30",
      icon: "text-green-500",
    },
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
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border sm:h-12 sm:w-12 sm:rounded-xl ${styles.iconWrap}`}
        >
          <Icon className={`text-lg sm:text-xl ${styles.icon}`} />
        </div>
      </div>
    </GlowCard>
  );
}
