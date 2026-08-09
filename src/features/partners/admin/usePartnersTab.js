"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_PARTNERS_TAB,
  PARTNERS_TABS,
} from "@/features/partners/admin/partnersTabs";

/**
 * URL-synced tab state for the admin Partners page.
 */
export default function usePartnersTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");
    return PARTNERS_TABS.some((t) => t.id === tab) ? tab : DEFAULT_PARTNERS_TAB;
  }, [searchParams]);

  const setTab = useCallback(
    (tabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tabId === DEFAULT_PARTNERS_TAB) {
        params.delete("tab");
      } else {
        params.set("tab", tabId);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, router, pathname]
  );

  return { activeTab, setTab, tabs: PARTNERS_TABS };
}
