"use client";

import { useEffect } from "react";

/**
 * Escape-to-close and body scroll lock for overlay modals.
 */
export function useModalBodyEffects(
  isOpen,
  onClose,
  { closeOnEscape = true, lockScroll = true } = {}
) {
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (!lockScroll) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, lockScroll]);
}
