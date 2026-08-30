"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Events from "@/features/events/Events";
import { useEffect } from "react";
import Executives from "@/features/executives/Executives";
import AdminCard from "@/features/dashboard/AdminCard";
import { LoadingState } from "@/components/ui/Spinner";
import { GlowCard } from "@/components/ui/spotlight-card";
import { getAdminPanelCards, hasPermission, isStaffRole } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions";

export default function AdminDashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !isStaffRole(role))) {
      router.push("/login");
    }
  }, [status, router, role]);

  useEffect(() => {
    document.title = "Dashboard | FinTech Calgary";
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState size="lg" />
      </div>
    );
  }

  if (status !== "authenticated" || !isStaffRole(role)) {
    return null;
  }

  const panelCards = getAdminPanelCards(role);
  const showEvents = hasPermission(role, PERMISSIONS.EVENTS);
  const showExecutives = hasPermission(role, PERMISSIONS.EXECUTIVES);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>


      <main className="container mx-auto px-6 py-8 max-w-7xl relative animate-fadeIn">
        <div
          className="mb-6 p-4 rounded-xl border border-gray-700/30 bg-gray-900/60 backdrop-blur-xl
            flex items-center gap-3 text-sm fc-body max-w-fit animate-fadeIn hover:bg-gray-800/60 transition-all duration-300"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-primary"
            fill="currentColor"
          >
            <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z" />
          </svg>
          Best experience with Google Chrome
        </div>

        <div className="relative mb-8 animate-fadeIn">
          <GlowCard customSize glowColor="purple" className="w-full !gap-0 !p-8">
            <div className="relative z-10 space-y-4">
              <div className="inline-block px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm font-medium backdrop-blur-sm hover:scale-105 transition-transform border border-primary/30">
                Your Workspace
              </div>
              <div className="space-y-2">
                <h1 className="fc-title text-4xl sm:text-5xl font-bold tracking-tight">
                  Welcome back
                  <span className="bg-gradient-to-r from-primary to-violet-400/75 bg-clip-text text-transparent">
                    {session?.user?.username
                      ? ` ${session.user.username}`
                      : ""}
                  </span>
                </h1>
                <p className="fc-lede">
                  Track your events and collaborate with your team members
                </p>
              </div>
            </div>
          </GlowCard>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {panelCards.length > 0 && (
            <section className="group animate-fadeIn">
              <GlowCard
                customSize
                glowColor="purple"
                className="relative h-full w-full !gap-0 !p-8"
              >
                <div className="relative z-10 flex items-center justify-between mb-8">
                  <div className="space-y-2">
                    <h2 className="fc-title-accent text-2xl">Admin Panel</h2>
                    <p className="fc-body">
                      Manage system resources and user data
                    </p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary backdrop-blur-sm border border-primary/30">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {panelCards.map((card) => (
                    <AdminCard
                      key={card.href}
                      title={card.title}
                      description={card.description}
                      href={card.href}
                      color={card.color}
                      icon={(props) => (
                        <svg
                          {...props}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                    />
                  ))}
                </div>
              </GlowCard>
            </section>
          )}

          {showEvents && (
            <section className="group animate-fadeIn" id="events">
              <GlowCard
                customSize
                glowColor="purple"
                className="relative h-full w-full !gap-0 !p-8"
              >
                <div className="relative z-10 flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h2 className="fc-title-accent text-2xl">
                      Events and Webinars
                    </h2>
                    <p className="fc-body">Manage your schedule</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary backdrop-blur-sm border border-primary/30">
                    <FontAwesomeIcon icon={faChartBar} className="h-6 w-6" />
                  </span>
                </div>

                <div
                  className="mb-6 p-4 rounded-xl border border-gray-700/30 hover:border-primary/50 bg-gradient-to-br from-gray-800/60 via-purple-900/10 to-gray-800/40
             shadow-lg hover:shadow-purple-600/20 duration-300 backdrop-blur-xl max-w-md sm:max-w-full transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl bg-purple-700/20 text-purple-300 backdrop-blur-sm border border-purple-500/30">
                      <FontAwesomeIcon icon={faClock} className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="fc-title text-sm">Reminder</h3>
                      <p className="fc-body text-xs leading-relaxed">
                        No need to delete past events—they&apos;ll remain on the
                        events page. Delete only those you no longer want to
                        display.
                      </p>
                    </div>
                  </div>
                </div>

                <Events />
              </GlowCard>
            </section>
          )}

          {showExecutives && (
            <section className="group animate-fadeIn">
              <GlowCard
                customSize
                glowColor="purple"
                className="relative h-full w-full !gap-0 !p-8"
              >
                <div className="relative z-10 flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h2 className="fc-title-accent text-2xl" id="executives">
                      Team
                    </h2>
                    <p className="fc-body">Collaborate with others</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary backdrop-blur-sm border border-primary/30">
                    <FontAwesomeIcon icon={faUsers} className="h-6 w-6" />
                  </span>
                </div>
                <Executives />
              </GlowCard>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
