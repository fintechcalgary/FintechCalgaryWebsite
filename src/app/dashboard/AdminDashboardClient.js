"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "@/components/Navbar";
import Events from "@/components/Events";
import { useEffect, useState } from "react";
import Executives from "@/components/Executives";
import Link from "next/link";

const AdminCard = ({ title, description, icon: Icon, href, color, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-semibold text-white transition-all duration-300"
            style={{
              transform: isHovered ? "translateY(-2px)" : "translateY(0)",
            }}
          >
            {title}
          </h3>
          <div
            className={`w-10 h-10 bg-gradient-to-br from-${color}/20 to-${color}/30 rounded-lg flex items-center justify-center border border-${color}/30 transition-all duration-300 ${
              isHovered ? "scale-110 shadow-lg shadow-primary/25" : ""
            }`}
          >
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
        </div>
        <p
          className="text-gray-300 text-sm transition-all duration-300 mb-4 flex-grow"
          style={{
            opacity: isHovered ? 1 : 0.8,
          }}
        >
          {description}
        </p>
        <div className="flex justify-end mt-auto">
          <div className="text-primary group-hover:translate-x-1 transition-transform duration-300">
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
        </div>
      </div>
    </Link>
  );
};

export default function AdminDashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.push("/login");
    }
  }, [status, router, session]);

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-7xl relative animate-fadeIn">
        {/* Browser recommendation message */}
        <div
          className="mb-6 p-4 rounded-xl border border-gray-700/30 bg-gray-900/60 backdrop-blur-xl
            flex items-center gap-3 text-sm text-gray-300 max-w-fit animate-fadeIn hover:bg-gray-800/60 transition-all duration-300"
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

        {/* Welcome section */}
        <div className="relative overflow-hidden rounded-2xl mb-8 animate-fadeIn">
          <div className="relative bg-gray-900/80 backdrop-blur-2xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20">
            <div className="relative z-10 space-y-4">
              <div className="inline-block px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm font-medium backdrop-blur-sm hover:scale-105 transition-transform border border-primary/30">
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
                className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 
                          transition-all duration-500 hover:bg-gray-900/90 hover:shadow-2xl hover:shadow-primary/20
                          hover:border-primary/50 overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-between mb-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">
                      Admin Panel
                    </h2>
                    <p className="text-sm text-gray-400">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AdminCard
                    title="Partners"
                    description="View and manage partner organizations, approve applications, and export data"
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    )}
                    href="/dashboard/partners"
                    color="purple"
                    index={0}
                  />

                  <AdminCard
                    title="Executive Applications"
                    description="Review executive team applications, manage roles, and control application settings"
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
                    href="/dashboard/executive-applications"
                    color="orange"
                    index={1}
                  />

                  <AdminCard
                    title="Members"
                    description="Manage general members, mailing lists, and export member data"
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    href="/dashboard/members"
                    color="green"
                    index={2}
                  />
                </div>
              </div>
            </section>
          )}

          <section className="group animate-fadeIn">
            <div
              className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 
                            transition-all duration-500 hover:bg-gray-900/90 hover:shadow-2xl hover:shadow-primary/20
                            hover:border-primary/50 overflow-hidden"
              id="events"
            >
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-white">
                    Events and Webinars
                  </h2>
                  <p className="text-sm text-gray-400">Manage your schedule</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary backdrop-blur-sm border border-primary/30">
                  <FontAwesomeIcon icon={faChartBar} className="h-6 w-6" />
                </span>
              </div>

              {/* Enhanced Reminder Section */}
              <div
                className="mb-6 p-4 rounded-xl border border-gray-700/30 hover:border-primary/50 bg-gradient-to-br from-gray-800/60 via-purple-900/20 to-gray-800/40
             shadow-lg hover:shadow-purple-600/20 duration-300 backdrop-blur-xl max-w-md sm:max-w-full transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl bg-purple-700/20 text-purple-300 backdrop-blur-sm border border-purple-500/30">
                    <FontAwesomeIcon icon={faClock} className="h-5 w-5" />
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
              className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 
                            transition-all duration-500 hover:bg-gray-900/90 hover:shadow-2xl hover:shadow-primary/20
                            hover:border-primary/50 overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2
                    className="text-2xl font-semibold text-white"
                    id="executives"
                  >
                    Team
                  </h2>
                  <p className="text-sm text-gray-400">
                    Collaborate with others
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary backdrop-blur-sm border border-primary/30">
                  <FontAwesomeIcon icon={faUsers} className="h-6 w-6" />
                </span>
              </div>
              <Executives />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
