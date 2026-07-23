"use client";

import { useEffect } from "react";

/**
 * Set document.title while the component is mounted.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
}
