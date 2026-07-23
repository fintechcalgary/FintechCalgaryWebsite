"use client";

import { useCallback, useEffect, useState } from "react";

async function fetchPendingCount() {
  const response = await fetch("/api/partner-applications");
  if (!response.ok) return 0;
  const data = await response.json();
  return Array.isArray(data)
    ? data.filter((m) => m.approvalStatus === "pending").length
    : 0;
}

/**
 * Pending partner-application count for tab badges.
 * Call refresh() after approve/reject/delete so the badge stays current.
 */
export default function usePendingApplicationsBadge(enabled = true) {
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) return 0;
    try {
      const count = await fetchPendingCount();
      setPendingCount(count);
      return count;
    } catch (error) {
      console.error("Failed to load pending applications count:", error);
      return 0;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    fetchPendingCount()
      .then((count) => {
        if (!cancelled) setPendingCount(count);
      })
      .catch((error) => {
        console.error("Failed to load pending applications count:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { pendingCount, refresh };
}
