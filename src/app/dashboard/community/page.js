"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { GlowCard } from "@/components/ui/spotlight-card";
import { LoadingState } from "@/components/ui/Spinner";
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState size="lg" />
      </div>
    );
  }

  if (status !== "authenticated" || !canAccess) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <main className="container relative mx-auto max-w-7xl animate-fadeIn px-6 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-primary"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <GlowCard customSize glowColor="purple" className="w-full !gap-0 !p-8">
          <div className="relative z-10 mb-8 space-y-2">
            <h1 className="fc-title-accent text-3xl">Community Posts</h1>
            <p className="fc-body">
              Promote partner and community events on the public Community Board.
            </p>
          </div>
          <CommunityPostsAdmin />
        </GlowCard>
      </main>
    </div>
  );
}
