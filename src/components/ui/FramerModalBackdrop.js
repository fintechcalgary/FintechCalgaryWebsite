"use client";

import { motion } from "framer-motion";

const defaultTransition = { duration: 0.2 };

/**
 * Shared dimmed backdrop for Framer Motion modals (insights, etc.).
 */
export default function FramerModalBackdrop({
  onClose,
  motionKey,
  className = "bg-black/70 backdrop-blur-sm",
  transition = defaultTransition,
}) {
  return (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      onClick={onClose}
      className={`fixed inset-0 z-50 ${className}`.trim()}
    />
  );
}
