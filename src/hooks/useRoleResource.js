"use client";

import { useCallback, useEffect, useState } from "react";
import useRoleAccess from "@/hooks/useRoleAccess";

/**
 * Session gate + list resource fetch for role-protected dashboard pages.
 */
export default function useRoleResource(url, requiredPermission, options = {}) {
  const { initialData = [] } = options;
  const { session, status, canAccess, isLoading: authLoading } =
    useRoleAccess(requiredPermission);

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!url || !canAccess) return null;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
      }

      const json = await response.json();
      setData(json);
      return json;
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err);
      setError(err.message || "Failed to load data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, canAccess]);

  useEffect(() => {
    if (status === "authenticated" && canAccess) {
      refetch();
    } else if (status === "authenticated" && !canAccess) {
      setLoading(false);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, canAccess, refetch]);

  return {
    session,
    status,
    canAccess,
    data,
    setData,
    loading: authLoading || loading,
    error,
    refetch,
  };
}
