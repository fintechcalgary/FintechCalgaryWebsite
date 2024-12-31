"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChartBarIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Events from "@/components/Events";
import { useEffect } from "react";
import Members from "@/components/Members";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-8 max-w-7xl"
      >
        {/* Welcome section with enhanced animation */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="relative overflow-hidden rounded-2xl mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500/30 to-primary/10 animate-gradient-x rounded-2xl" />
          <div className="relative bg-gray-900/60 backdrop-blur-2xl p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium backdrop-blur-sm"
              >
                Your Workspace
              </motion.div>
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
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced content grid with wider cards */}
        <div className="grid grid-cols-1 gap-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <div
              className="relative h-full bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                            transition-all duration-300 hover:bg-gray-900/70 hover:shadow-xl hover:shadow-primary/10
                            hover:border-white/20 overflow-hidden"
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
              <Events />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group"
          >
            <div
              className="relative h-full bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                            transition-all duration-300 hover:bg-gray-900/70 hover:shadow-xl hover:shadow-primary/10
                            hover:border-white/20 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-white">Team</h2>
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
          </motion.section>
        </div>
      </motion.main>
    </div>
  );
}
