"use client";

import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiUsers } from "react-icons/fi";
import Navbar from "@/components/layout/AdminNavbar";
import { LoadingState } from "@/components/ui/Spinner";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import PartnersPageHeader from "@/features/partners/admin/PartnersPageHeader";
import PartnersTabNav from "@/features/partners/admin/PartnersTabNav";
import DisplayPartnersPanel from "@/features/partners/admin/DisplayPartnersPanel";
import PartnerApplicationsPanel from "@/features/partners/admin/PartnerApplicationsPanel";
import usePartnersTab from "@/features/partners/admin/usePartnersTab";
import usePendingApplicationsBadge from "@/features/partners/admin/usePendingApplicationsBadge";

function PartnersPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "admin";
  const { activeTab, setTab, tabs } = usePartnersTab();
  const { pendingCount, refresh: refreshPendingCount } =
    usePendingApplicationsBadge(status === "authenticated" && isAdmin);

  useDocumentTitle("Partners | FinTech Calgary");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <LoadingState fullScreen />
      </div>
    );
  }

  if (status !== "authenticated" || !isAdmin) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="min-h-[400px] sm:min-h-[500px] flex items-center justify-center">
            <div className="text-center px-4">
              <FiUsers className="mx-auto text-3xl sm:text-4xl text-primary mb-3 sm:mb-4" />
              <p className="text-gray-400">
                You don&apos;t have permission to view this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <PartnersPageHeader />
        <PartnersTabNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setTab}
          badges={{ applications: pendingCount }}
        />
        <div role="tabpanel" id={`partners-panel-${activeTab}`}>
          {activeTab === "display" ? (
            <DisplayPartnersPanel />
          ) : (
            <PartnerApplicationsPanel onApplicationsChange={refreshPendingCount} />
          )}
        </div>
      </main>
    </div>
  );
}

export default function PartnersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <Navbar />
          <LoadingState fullScreen />
        </div>
      }
    >
      <PartnersPageContent />
    </Suspense>
  );
}
