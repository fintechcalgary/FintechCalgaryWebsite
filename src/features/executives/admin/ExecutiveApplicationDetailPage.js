"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminBackLink from "@/components/ui/AdminBackLink";
import { LoadingState } from "@/components/ui/Spinner";
import useRoleAccess from "@/hooks/useRoleAccess";
import { PERMISSIONS } from "@/lib/permissions";
import ExecutiveApplicationDetail from "@/features/executives/admin/ExecutiveApplicationDetail";

export default function ExecutiveApplicationDetailPage() {
  const { applicationId } = useParams();
  const { status, canAccess, isLoading: authLoading } = useRoleAccess(
    PERMISSIONS.EXECUTIVE_APPLICATIONS,
  );
  const [application, setApplication] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicationId || authLoading || status !== "authenticated" || !canAccess) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [appRes, rolesRes] = await Promise.all([
          fetch(`/api/executive-application?id=${applicationId}`),
          fetch("/api/executive-roles"),
        ]);

        if (!appRes.ok) {
          throw new Error(
            appRes.status === 404
              ? "Application not found"
              : "Failed to load application",
          );
        }

        const appData = await appRes.json();
        const rolesData = rolesRes.ok ? await rolesRes.json() : [];

        if (!cancelled) {
          setApplication(appData);
          setRoles(Array.isArray(rolesData) ? rolesData : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load application");
          setApplication(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [applicationId, authLoading, status, canAccess]);

  useEffect(() => {
    if (application?.name) {
      document.title = `${application.name} | Executive Applications`;
    } else {
      document.title = "Application Details | FinTech Calgary";
    }
  }, [application]);

  if (authLoading || status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState size="lg" />
      </div>
    );
  }

  if (status !== "authenticated" || !canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <main className="container relative mx-auto max-w-5xl animate-fadeIn px-6 py-8">
        <AdminBackLink
          href="/dashboard/executive-applications"
          label="Back to Applications"
        />

        {error ? (
          <div className="fc-admin-panel p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : application ? (
          <ExecutiveApplicationDetail
            application={application}
            roles={roles}
          />
        ) : null}
      </main>
    </div>
  );
}
