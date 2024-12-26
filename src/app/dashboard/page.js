"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Welcome, {session?.user?.email}
          </h2>
          <p className="text-gray-400">
            Manage your events and schedule from your personal dashboard.
          </p>
        </div>
        <Events />
        <div className="mt-12">
          <Members />
        </div>
      </main>
    </div>
  );
}
