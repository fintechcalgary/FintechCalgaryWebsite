"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useModalBodyEffects } from "@/hooks/useModalBodyEffects";

const spring = { type: "spring", damping: 25, stiffness: 300 };

/**
 * Shared portal modal shell: backdrop, body lock, Escape-to-close.
 * layout="center" wraps children in a centered overlay (default).
 * layout="none" portals backdrop + children only (for custom full-bleed panels).
 */
export default function ModalRoot({
  isOpen,
  onClose,
  children,
  layout = "center",
  usePortal = true,
  backdropClassName = "",
  containerClassName = "",
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useModalBodyEffects(isOpen, onClose);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fc-modal-backdrop ${backdropClassName}`.trim()}
            onClick={onClose}
          />
          {layout === "center" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={spring}
              className={`fc-modal-container ${containerClassName}`.trim()}
            >
              {children}
            </motion.div>
          ) : (
            children
          )}
        </>
      )}
    </AnimatePresence>
  );

  if (!usePortal) return content;
  if (!mounted) return null;
  return createPortal(content, document.body);
}
