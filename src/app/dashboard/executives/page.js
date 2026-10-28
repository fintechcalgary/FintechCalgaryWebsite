"use client";

import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import Executives from "@/features/executives/Executives";
import { LoadingState } from "@/components/ui/Spinner";
import { GlowCard } from "@/components/ui/spotlight-card";
import AdminBackLink from "@/components/ui/AdminBackLink";
import useRoleAccess from "@/hooks/useRoleAccess";
import { PERMISSIONS } from "@/lib/permissions";

export default function ExecutivesDashboardPage() {
  const { status, canAccess, isLoading } = useRoleAccess(PERMISSIONS.EXECUTIVES);

  useEffect(() => {
    document.title = "Executives | FinTech Calgary";
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

        <div className="mb-8 space-y-2">
          <h1 className="fc-title text-4xl font-bold tracking-tight">
            Executives
          </h1>
          <p className="fc-lede">
            Manage the executive team shown on the public site.
          </p>
        </div>

        <GlowCard
          customSize
          glowColor="purple"
          className="relative h-full w-full !gap-0 !p-8"
        >
          <div className="relative z-10 mb-8 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="fc-title-accent text-2xl">Team</h2>
              <p className="fc-body">Collaborate with others</p>
            </div>
            <span className="fc-icon">
              <FontAwesomeIcon icon={faUsers} className="h-6 w-6" />
            </span>
          </div>
          <Executives />
        </GlowCard>
      </main>
    </div>
  );
}
