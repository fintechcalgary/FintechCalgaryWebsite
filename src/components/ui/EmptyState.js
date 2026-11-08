"use client";
import { ADMIN_PANEL_CLASS, GLASS_CARD_CLASS, ICON_GLYPH_CLASS } from "@/lib/uiTokens";

/**
 * Shared empty / zero-data panel for public (fc-card) and admin (fc-admin-panel).
 */
export default function EmptyState({
  variant = "admin",
  icon: Icon,
  title,
  children,
  action,
  className = "",
  minHeightClass = "min-h-[240px]",
}) {
  const shell = variant === "public" ? GLASS_CARD_CLASS : ADMIN_PANEL_CLASS;

  return (
    <div
      className={`${shell} flex flex-col items-center justify-center px-6 py-12 text-center ${minHeightClass} ${className}`.trim()}
    >
      {Icon ? (
        <span className={`${ICON_GLYPH_CLASS} mx-auto mb-4`.trim()} aria-hidden>
          <Icon className="h-10 w-10" />
        </span>
      ) : null}
      {title ? <h4 className="mb-2">{title}</h4> : null}
      {children ? (
        <p className="text-muted max-w-md">{children}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
