"use client";

import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faClock } from "@fortawesome/free-solid-svg-icons";
import Events from "@/features/events/Events";
import { LoadingState } from "@/components/ui/Spinner";
import { GlowCard } from "@/components/ui/spotlight-card";
import AdminBackLink from "@/components/ui/AdminBackLink";
import useRoleAccess from "@/hooks/useRoleAccess";
import { PERMISSIONS } from "@/lib/permissions";

export default function EventsDashboardPage() {
  const { status, canAccess, isLoading } = useRoleAccess(PERMISSIONS.EVENTS);

  useEffect(() => {
    document.title = "Events | FinTech Calgary";
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
          <h1 className="fc-title text-4xl font-bold tracking-tight">Events</h1>
          <p className="fc-lede">Manage events, webinars, and registration.</p>
        </div>

        <GlowCard
          customSize
          glowColor="purple"
          className="relative h-full w-full !gap-0 !p-8"
        >
          <div className="relative z-10 mb-8 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="fc-title-accent text-2xl">Events and Webinars</h2>
              <p className="fc-body">Manage your schedule</p>
            </div>
            <span className="fc-icon">
              <FontAwesomeIcon icon={faChartBar} className="h-6 w-6" />
            </span>
          </div>

          <div className="mb-6 max-w-md rounded-xl border border-gray-700/30 bg-gradient-to-br from-gray-800/60 via-purple-900/10 to-gray-800/40 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-purple-600/20 sm:max-w-full">
            <div className="flex items-center space-x-3">
              <div className="fc-icon hidden md:inline-flex">
                <FontAwesomeIcon icon={faClock} className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="fc-title text-sm">Reminder</h3>
                <p className="fc-body text-xs leading-relaxed">
                  No need to delete past events—they&apos;ll remain on the
                  events page. Delete only those you no longer want to display.
                  If an event fills up, close registration on its card instead
                  of deleting it.
                </p>
              </div>
            </div>
          </div>

          <Events />
        </GlowCard>
      </main>
    </div>
  );
}
