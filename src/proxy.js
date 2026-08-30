import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import {
  canAccessApiRoute,
  canAccessDashboardRoute,
  isStaffRole,
} from "@/lib/permissions";

const PUBLIC_POST_ENDPOINTS = [
  { path: "/api/executive-application", method: "POST" },
  { path: "/api/contact", method: "POST" },
  { path: "/api/subscribe", method: "POST" },
  { path: "/api/partner-applications", method: "POST" },
  { path: "/api/events/", method: "POST", suffix: "/register" },
  { path: "/api/auth/register", method: "POST" },
  { path: "/api/logs", method: "POST" },
];

const PROTECTED_API_PREFIXES = [
  "/api/executive-application",
  "/api/executive-roles",
  "/api/settings",
  "/api/partners",
  "/api/partner-applications",
  "/api/executives",
  "/api/members",
  "/api/contracts",
  "/api/events",
  "/api/documentation",
  "/api/marketing-approvals",
  "/api/users",
  "/api/upload",
];

const PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

function isPublicPostEndpoint(pathname, method) {
  return PUBLIC_POST_ENDPOINTS.some((endpoint) => {
    if (endpoint.suffix) {
      return (
        pathname.startsWith(endpoint.path) &&
        pathname.endsWith(endpoint.suffix) &&
        method === endpoint.method
      );
    }
    return pathname.startsWith(endpoint.path) && method === endpoint.method;
  });
}

function isProtectedApiRoute(pathname, method) {
  const isStandardProtected = PROTECTED_API_PREFIXES.some((route) =>
    pathname.startsWith(route),
  );

  const isEventDeleteRoute =
    pathname.startsWith("/api/events/") &&
    pathname.endsWith("/register") &&
    method === "DELETE";

  return isStandardProtected || isEventDeleteRoute;
}

function checkApiAccess(token, pathname, method) {
  // publicGet routes (events, partners, settings, …) are intentionally open
  if (canAccessApiRoute(token?.role ?? null, pathname, method)) {
    return null;
  }

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}

function checkDashboardAccess(token, pathname) {
  if (!token) {
    return NextResponse.redirect(new URL("/login", pathname));
  }

  if (!isStaffRole(token.role)) {
    if (token.role === "associate") {
      return NextResponse.redirect(new URL("/partner-dashboard", pathname));
    }
    return NextResponse.redirect(new URL("/login", pathname));
  }

  if (!canAccessDashboardRoute(token.role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", pathname));
  }

  return null;
}

export default withAuth(
  function proxy(req) {
    const { pathname, method } = req.nextUrl;

    if (pathname.startsWith("/dashboard")) {
      const dashboardError = checkDashboardAccess(req.nextauth.token, req.url);
      if (dashboardError) return dashboardError;
      return NextResponse.next();
    }

    if (isPublicPostEndpoint(pathname, method)) {
      return NextResponse.next();
    }

    if (!isProtectedApiRoute(pathname, method)) {
      return NextResponse.next();
    }

    const isProtectedMethod = PROTECTED_METHODS.includes(method);
    const isProtectedGet =
      method === "GET" && isProtectedApiRoute(pathname, method);

    if (isProtectedMethod || isProtectedGet) {
      const authError = checkApiAccess(req.nextauth.token, pathname, method);
      if (authError) return authError;
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only gate the dashboard here. API auth is enforced in the handler
        // with JSON 401/403 — returning false would HTML-redirect to sign-in.
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    "/api/executive-application/:path*",
    "/api/executive-roles/:path*",
    "/api/settings/:path*",
    "/api/partners/:path*",
    "/api/partner-applications/:path*",
    "/api/executives/:path*",
    "/api/members/:path*",
    "/api/contracts/:path*",
    "/api/events/:path*",
    "/api/documentation/:path*",
    "/api/marketing-approvals/:path*",
    "/api/users/:path*",
    "/api/upload/:path*",
    "/dashboard/:path*",
  ],
};
