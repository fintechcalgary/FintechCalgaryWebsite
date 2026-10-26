"use client";

import { FiX } from "react-icons/fi";

/**
 * Shared icon-only modal close control.
 */
export default function ModalCloseButton({
  onClick,
  className = "",
  label = "Close",
  size = "md",
}) {
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fc-modal-icon-close ${className}`.trim()}
      aria-label={label}
      title={label}
    >
      <FiX className={iconClass} />
    </button>
  );
}
