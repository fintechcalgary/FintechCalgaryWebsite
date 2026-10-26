"use client";

import ModalRoot from "./ModalRoot";
import ModalCloseButton from "./ModalCloseButton";

const SIZE_MAX_WIDTH = {
  sm: "max-w-md",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
};

/**
 * General content / form modal with optional title header and sticky footer.
 * Prefer `size` ("sm" | "md" | "lg" | "xl"); `maxWidth` remains for callers
 * that already pass Tailwind classes.
 */
export default function ContentModal({
  isOpen,
  onClose,
  children,
  title,
  footer,
  size,
  maxWidth,
  showCloseButton = true,
  panelClassName = "",
  bodyClassName = "",
}) {
  const widthClass =
    maxWidth || SIZE_MAX_WIDTH[size] || SIZE_MAX_WIDTH.lg;

  return (
    <ModalRoot isOpen={isOpen} onClose={onClose}>
      <div
        className={`fc-modal-panel mx-auto flex max-h-[90vh] flex-col border-gray-800/50 ${widthClass} ${panelClassName}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
      >
        {title ? (
          <div className="fc-modal-header">
            <h2 className="fc-modal-title">{title}</h2>
            {showCloseButton ? <ModalCloseButton onClick={onClose} /> : null}
          </div>
        ) : null}
        <div
          className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`.trim()}
        >
          {children}
        </div>
        {footer ? <div className="fc-modal-footer">{footer}</div> : null}
      </div>
    </ModalRoot>
  );
}
