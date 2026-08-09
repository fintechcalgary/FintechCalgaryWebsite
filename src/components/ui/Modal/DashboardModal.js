"use client";

import { useModalBodyEffects } from "@/hooks/useModalBodyEffects";

const SIZE_PANEL = {
  sm: "max-w-md rounded-xl p-4 sm:p-6",
  md: "max-w-2xl rounded-xl p-4 sm:p-6",
  lg: "max-w-4xl rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto",
};

/**
 * Centered overlay + glass panel for admin dashboard pages.
 * Styling tokens live in globals.css (fc-dashboard-modal-*).
 */
export default function DashboardModal({
  isOpen,
  onClose,
  children,
  size = "sm",
  panelClassName = "",
}) {
  useModalBodyEffects(isOpen, onClose);

  if (!isOpen) return null;

  const panelSize = SIZE_PANEL[size] ?? SIZE_PANEL.sm;

  return (
    <div
      className="fc-dashboard-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`fc-dashboard-modal-panel ${panelSize} ${panelClassName}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
