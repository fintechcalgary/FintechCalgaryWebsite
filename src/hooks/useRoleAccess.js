"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions";

/**
 * Client-side role and permission checks for dashboard pages.
 */
export default function useRoleAccess(requiredPermission) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  const canAccess = requiredPermission
    ? hasPermission(role, requiredPermission)
    : true;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && requiredPermission && !canAccess) {
      router.push("/dashboard");
    }
  }, [status, requiredPermission, canAccess, router]);

  return {
    session,
    status,
    role,
    canAccess,
    isLoading: status === "loading",
    isAdmin: role === "admin",
    hasPermission: (permission) => hasPermission(role, permission),
    canManageFinance: hasPermission(role, PERMISSIONS.DOCUMENTATION_FINANCE),
    canSubmitMarketing: hasPermission(role, PERMISSIONS.MARKETING_SUBMIT),
    canApproveMarketing: hasPermission(role, PERMISSIONS.MARKETING_APPROVE),
  };
}
