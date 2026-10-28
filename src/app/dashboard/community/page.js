"use client";

import { useEffect } from "react";
import { LoadingState } from "@/components/ui/Spinner";
import AdminBackLink from "@/components/ui/AdminBackLink";
import { AdminPageHeader } from "@/components/layout/AdminPageShell";
import CommunityPostsAdmin from "@/features/community/CommunityPostsAdmin";
import useRoleAccess from "@/hooks/useRoleAccess";
import { PERMISSIONS } from "@/lib/permissions";

export default function CommunityDashboardPage() {
  const { status, canAccess, isLoading } = useRoleAccess(PERMISSIONS.COMMUNITY);

  useEffect(() => {
    document.title = "Community Posts | FinTech Calgary";
  }, []);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen">
        <LoadingState fullScreen />
      </div>
    );
  }

  if (status !== "authenticated" || !canAccess) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <main className="container relative mx-auto max-w-7xl animate-fadeIn px-6 py-8">
        <AdminBackLink />
        <AdminPageHeader
          title="Community Posts"
          lede="Promote partner and community events on the public Community Board."
        />
        <CommunityPostsAdmin />
      </main>
    </div>
  );
}
