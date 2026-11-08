"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useModalBodyEffects } from "@/hooks/useModalBodyEffects";
import { useModalMotion } from "@/hooks/useModalMotion";
import { modalBackdrop, modalContainer } from "@/lib/uiClassNames";

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

  const { backdrop, panel } = useModalMotion();
  const onExitComplete = useModalBodyEffects(isOpen, onClose);

  const content = (
    <AnimatePresence onExitComplete={onExitComplete}>
      {isOpen ? (
        <>
          <motion.div
            key="modal-backdrop"
            role="presentation"
            initial={backdrop.initial}
            animate={backdrop.animate}
            exit={backdrop.exit}
            transition={backdrop.transition}
            className={`${modalBackdrop} ${backdropClassName}`.trim()}
            onClick={onClose}
          />
          {layout === "center" ? (
            <motion.div
              key="modal-panel"
              initial={panel.initial}
              animate={panel.animate}
              exit={panel.exit}
              transition={panel.transition}
              className={`${modalContainer} ${containerClassName}`.trim()}
            >
              {children}
            </motion.div>
          ) : (
            children
          )}
        </>
      ) : null}
    </AnimatePresence>
  );

  if (!usePortal) return content;
  if (!mounted) return null;
  return createPortal(content, document.body);
}
