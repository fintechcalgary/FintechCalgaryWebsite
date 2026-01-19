import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Constants for route configuration
const PROTECTED_API_ROUTES = [
  "/api/executive-application",
  "/api/executive-roles",
  "/api/settings",
  "/api/partners",
  "/api/executives",
  "/api/members",
];

const ADMIN_ONLY_ROUTES = [
  "/api/executive-application",
  "/api/executive-roles",
  "/api/settings",
  "/api/executives",
  "/api/events",
  "/api/members",
];

const PUBLIC_GET_ROUTES = ["/api/settings", "/api/executive-roles"];

const PUBLIC_POST_ENDPOINTS = [
  { path: "/api/executive-application", method: "POST" },
  { path: "/api/contact", method: "POST" },
  { path: "/api/subscribe", method: "POST" },
  { path: "/api/partners", method: "POST" },
  { path: "/api/events/", method: "POST", suffix: "/register" },
  { path: "/api/upload", method: "POST" },
  { path: "/api/auth/register", method: "POST" },
  { path: "/api/logs", method: "POST" },
];

const PROTECTED_METHODS = ["POST", "PUT", "DELETE"];

// Helper functions
function isProtectedApiRoute(pathname, method) {
  const isStandardProtectedRoute = PROTECTED_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isEventDeleteRoute =
    pathname.startsWith("/api/events/") &&
    pathname.endsWith("/register") &&
    method === "DELETE";

  return isStandardProtectedRoute || isEventDeleteRoute;
}

function isPublicPostEndpoint(pathname, method) {
  return PUBLIC_POST_ENDPOINTS.some((endpoint) => {
    if (endpoint.suffix) {
      return (
        pathname.startsWith(endpoint.path) &&
        pathname.endsWith(endpoint.suffix) &&
        method === endpoint.method
      );
    }
    return (
      pathname.startsWith(endpoint.path) && method === endpoint.method
    );
  });
}

function isPublicGetRoute(pathname) {
  return PUBLIC_GET_ROUTES.some((route) => pathname.startsWith(route));
}

function isAdminRoute(pathname) {
  return ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}

function checkAuthAndRole(token, pathname) {
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (isAdminRoute(pathname) && token.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return null;
}

export default withAuth(
  function middleware(req) {
    const { pathname, method } = req.nextUrl;

    // Allow public GET routes
    if (method === "GET" && isPublicGetRoute(pathname)) {
      return NextResponse.next();
    }

    // Allow public POST endpoints (must check before protected route check)
    if (isPublicPostEndpoint(pathname, method)) {
      return NextResponse.next();
    }

    // Check if route needs protection
    if (!isProtectedApiRoute(pathname, method)) {
      return NextResponse.next();
    }

    const isProtectedMethod = PROTECTED_METHODS.includes(method);

    // Handle protected methods (POST, PUT, DELETE)
    if (isProtectedMethod) {
      const authError = checkAuthAndRole(req.nextauth.token, pathname);
      if (authError) return authError;
    }

    // Handle GET requests to protected routes (except public GET routes)
    if (method === "GET" && !isPublicGetRoute(pathname)) {
      const authError = checkAuthAndRole(req.nextauth.token, pathname);
      if (authError) return authError;
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname, method } = req.nextUrl;
        
        // Allow public POST endpoints without authentication
        if (isPublicPostEndpoint(pathname, method)) {
          return true;
        }
        
        // Allow public GET routes without authentication
        if (method === "GET" && isPublicGetRoute(pathname)) {
          return true;
        }
        
        // For API routes, authentication is handled in the middleware function above
        // For non-API routes (like dashboard), require authentication
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        
        // Allow other routes (authentication will be checked in middleware function if needed)
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect API routes
    "/api/executive-application/:path*",
    "/api/executive-roles/:path*",
    "/api/settings/:path*",
    "/api/partners/:path*",
    "/api/executives/:path*",
    "/api/members/:path*",
    "/api/events/:path*",
    "/api/upload/:path*",
    "/api/auth/:path*",
    "/api/logs/:path*",
    "/api/contact/:path*",
    // Note: /api/subscribe is excluded from matcher as it's a public endpoint
    // Protect dashboard routes
    "/dashboard/:path*",
  ],
};
