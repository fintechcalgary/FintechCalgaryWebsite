"use client";

import { useState } from "react";

/**
 * Shared confirm-delete modal state for admin list pages.
 * @returns {{ isOpen: boolean, target: any, ask: (item: any) => void, close: () => void }}
 */
export default function useConfirmDelete() {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState(null);

  const ask = (item) => {
    setTarget(item);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setTarget(null);
  };

  return { isOpen, target, ask, close };
}
