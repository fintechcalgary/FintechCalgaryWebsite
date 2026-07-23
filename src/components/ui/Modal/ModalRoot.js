"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useModalBodyEffects } from "@/hooks/useModalBodyEffects";

const spring = { type: "spring", damping: 25, stiffness: 300 };

/**
 * Shared portal modal shell: backdrop, body lock, Escape-to-close.
 */
export default function ModalRoot({
  isOpen,
  onClose,
  children,
  backdropClassName = "bg-black/70 backdrop-blur-2xl z-[999998]",
  containerClassName = "z-[999999]",
  usePortal = true,
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
            className={`fixed inset-0 ${backdropClassName}`.trim()}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={spring}
            className={`fixed inset-0 flex items-center justify-center p-4 pointer-events-none ${containerClassName}`.trim()}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!usePortal) return content;
  if (!mounted) return null;
  return createPortal(content, document.body);
}
