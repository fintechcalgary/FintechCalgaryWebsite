"use client";

import ModalRoot from "./ModalRoot";

const SIZE_PANEL = {
  sm: "max-w-md p-4 sm:p-6",
  md: "max-w-2xl p-4 sm:p-6",
  lg: "max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8",
};

/**
 * Padded content modal for dashboard forms/details.
 * Thin wrapper over ModalRoot with size presets (portal + shared panel theme).
 */
export default function DashboardModal({
  isOpen,
  onClose,
  children,
  size = "sm",
  panelClassName = "",
}) {
  const panelSize = SIZE_PANEL[size] ?? SIZE_PANEL.sm;

  return (
    <ModalRoot isOpen={isOpen} onClose={onClose}>
      <div
        className={`fc-modal-panel mx-auto border-gray-800/50 ${panelSize} ${panelClassName}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </ModalRoot>
  );
}
