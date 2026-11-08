"use client";

import { useCallback, useEffect } from "react";

/**
 * Escape-to-close and body scroll lock while a modal is open.
 * Returns `onExitComplete` — call from AnimatePresence so scroll unlocks after the close animation.
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
    if (!lockScroll || !isOpen) return;
    document.body.style.overflow = "hidden";
  }, [isOpen, lockScroll]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return useCallback(() => {
    document.body.style.overflow = "";
  }, []);
}
