"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1];
const OPEN = { duration: 0.3, ease: EASE };
const CLOSE = { duration: 0.26, ease: EASE };

function fade(reduced) {
  if (reduced) {
    const t = { duration: 0.15, ease: "linear" };
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0, transition: t },
      transition: t,
    };
  }
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: CLOSE },
    transition: OPEN,
  };
}

/** Shared modal enter/exit (opacity; bleed modals add a small vertical slide). */
export function useModalMotion() {
  const reduced = useReducedMotion();

  return useMemo(() => {
    const shared = fade(reduced);
    const bleedPanel = reduced
      ? shared
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 10, transition: CLOSE },
          transition: OPEN,
        };

    return {
      backdrop: shared,
      panel: shared,
      bleedPanel,
    };
  }, [reduced]);
}
