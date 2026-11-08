"use client";

import { motion } from "framer-motion";
import ModalRoot from "./ModalRoot";
import ModalCloseButton from "./ModalCloseButton";
import { modalHeader, modalPanel, modalPanelBleed } from "@/lib/uiClassNames";

const ease = [0.16, 1, 0.3, 1];

/**
 * Edge-inset modal for large public content (weekly digest, article detail).
 * Uses shared fc-modal-panel theme; portals via ModalRoot layout="none".
 */
export default function BleedModal({
  isOpen,
  onClose,
  ariaLabel,
  header,
  footer,
  children,
  panelClassName = "",
  bodyClassName = "",
  bodyRef,
}) {
  return (
    <ModalRoot isOpen={isOpen} onClose={onClose} layout="none">
      <motion.div
        key="bleed-panel"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.3, ease }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`${modalPanel} ${modalPanelBleed} ${panelClassName}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {header}
        <div
          ref={bodyRef}
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`.trim()}
        >
          {children}
        </div>
        {footer}
      </motion.div>
    </ModalRoot>
  );
}

/**
 * Standard bleed modal header — title block + optional actions + close control.
 */
export function BleedModalHeader({
  onClose,
  title,
  subtitle,
  meta,
  actions,
  closeLabel = "Close dialog",
}) {
  return (
    <div className={`${modalHeader} flex-shrink-0 !items-start`.trim()}>
      <div className="min-w-0 flex-1 pr-2">
        {title}
        {subtitle}
        {meta}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {actions}
        <ModalCloseButton onClick={onClose} label={closeLabel} />
      </div>
    </div>
  );
}
