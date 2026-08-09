"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Admin session gate + list resource fetch for dashboard pages.
 *
 * @param {string} url - API endpoint that returns a JSON list (or value)
 * @param {Object} [options]
 * @param {boolean} [options.redirectUnauthenticated=true]
 * @param {boolean} [options.redirectNonAdmin=false]
 * @param {*} [options.initialData=[]]
 */
export default function useAdminResource(url, options = {}) {
  const {
    redirectUnauthenticated = true,
    redirectNonAdmin = false,
    initialData = [],
  } = options;

  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated" && redirectUnauthenticated) {
      router.push("/login");
    }
  }, [status, router, redirectUnauthenticated]);

  useEffect(() => {
    if (status === "authenticated" && !isAdmin && redirectNonAdmin) {
      router.push("/dashboard");
    }
  }, [status, isAdmin, redirectNonAdmin, router]);

  const refetch = useCallback(async () => {
    if (!url) return null;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);

      if (response.status === 401 && redirectUnauthenticated) {
        router.push("/login");
        return null;
      }

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
  }, [url, redirectUnauthenticated, router]);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      refetch();
    } else if (status === "authenticated" && !isAdmin) {
      setLoading(false);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, isAdmin, refetch]);

  return {
    session,
    status,
    isAdmin,
    data,
    setData,
    loading: status === "loading" || loading,
    error,
    refetch,
  };
}
