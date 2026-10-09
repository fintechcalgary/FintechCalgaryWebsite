"use client";

import { TONE_CLASSES, SIZE_CLASSES } from "@/lib/statusBadges";

/**
 * Shared status / pill badge used for approvals, upcoming/past, membership, etc.
 */
export default function StatusBadge({
  tone = "neutral",
  size = "md",
  icon: Icon,
  children,
  className = "",
  as: Component = "span",
}) {
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.neutral;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <Component
      className={`inline-flex items-center rounded-full border font-medium ${toneClass} ${sizeClass} ${className}`.trim()}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
      {children}
    </Component>
  );
}
