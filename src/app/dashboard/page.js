"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Events from "@/components/Events";
import { useEffect, useCallback } from "react";
import Members from "@/components/Members";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    document.title = "Dashboard | FinTech Calgary";
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen relative bg-background">
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-7xl relative animate-fadeIn">
        {/* Browser recommendation message */}
        <div
          className="mb-6 p-3 rounded-lg border border-white/10 bg-gray-900/60 backdrop-blur-sm
            flex items-center gap-3 text-sm text-gray-400 max-w-fit animate-fadeIn"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z" />
          </svg>
          Best experience with Google Chrome
        </div>

        {/* Welcome section */}
        <div className="relative overflow-hidden rounded-2xl mb-6 animate-fadeIn">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500/30 to-primary/10 animate-gradient-x rounded-2xl" />
          <div className="relative bg-gray-900/60 backdrop-blur-2xl p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium backdrop-blur-sm hover:scale-105 transition-transform">
                Your Workspace
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  Welcome back
                  <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    {session?.user?.email?.split("@")[0]
                      ? ` ${session.user.email.split("@")[0]}`
                      : ""}
                  </span>
                </h1>
                <p className="text-gray-300 text-lg">
                  Track your events and collaborate with your team members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-8">
          {/* Admin Section - Only visible to admins */}
          {session?.user?.role === "admin" && (
            <section className="group animate-fadeIn">
              <div
                className="relative h-full bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                          transition-all duration-300 hover:bg-gray-900/70 hover:shadow-xl hover:shadow-primary/10
                          hover:border-white/20 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-white">
                      Admin Panel
                    </h2>
                    <p className="text-sm text-gray-400">
                      Manage system resources
                    </p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary backdrop-blur-sm">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/dashboard/associate-members"
                    className="group relative overflow-hidden bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        Associate Members
                      </h3>
                      <svg
                        className="w-6 h-6 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm">
                      View and manage associate member organizations
                    </p>
                    <div className="absolute bottom-2 right-2 text-purple-400 group-hover:translate-x-1 transition-transform duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/subscribers"
                    className="group relative overflow-hidden bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        Subscribers
                      </h3>
                      <svg
                        className="w-6 h-6 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Manage newsletter subscribers and mailing lists
                    </p>
                    <div className="absolute bottom-2 right-2 text-green-400 group-hover:translate-x-1 transition-transform duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            </section>
          )}

          <section className="group animate-fadeIn">
            <div
              className="relative h-full bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                            transition-all duration-300 hover:bg-gray-900/70 hover:shadow-xl hover:shadow-primary/10
                            hover:border-white/20 overflow-hidden"
              id="events"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-white">Events</h2>
                  <p className="text-sm text-gray-400">Manage your schedule</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary backdrop-blur-sm">
                  <ChartBarIcon className="h-6 w-6" />
                </span>
              </div>

              {/* Reminder Section */}
              <div
                className="mb-6 p-4 rounded-lg border border-white/10 hover:border-white/20 bg-gradient-to-br from-gray-900/60 via-purple-900/20 to-gray-800/40
             shadow-md hover:shadow-purple-600/20 duration-300 backdrop-blur-lg max-w-md sm:max-w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-purple-700/20 text-purple-300 backdrop-blur-sm">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-white">
                      Reminder
                    </h3>
                    <p className="text-xs text-purple-100 leading-relaxed">
                      No need to delete past events—they&apos;ll remain on the
                      events page. Delete only those you no longer want to
                      display.
                    </p>
                  </div>
                </div>
              </div>

              <Events />
            </div>
          </section>

          <section className="group animate-fadeIn">
            <div
              className="relative h-full bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                            transition-all duration-300 hover:bg-gray-900/70 hover:shadow-xl hover:shadow-primary/10
                            hover:border-white/20 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2
                    className="text-2xl font-semibold text-white"
                    id="members"
                  >
                    Team
                  </h2>
                  <p className="text-sm text-gray-400">
                    Collaborate with others
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary backdrop-blur-sm">
                  <UserGroupIcon className="h-6 w-6" />
                </span>
              </div>
              <Members />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
