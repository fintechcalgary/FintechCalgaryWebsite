import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if the request is for a protected API endpoint
    const isProtectedApiRoute =
      req.nextUrl.pathname.startsWith("/api/executive-application") ||
      req.nextUrl.pathname.startsWith("/api/executive-roles") ||
      req.nextUrl.pathname.startsWith("/api/settings") ||
      req.nextUrl.pathname.startsWith("/api/associateMember") ||
      req.nextUrl.pathname.startsWith("/api/members") ||
      req.nextUrl.pathname.startsWith("/api/subscribers");

    // For API routes, we want to protect POST, PUT, DELETE methods
    // EXCEPT for public endpoints that should remain accessible without authentication
    const isProtectedMethod = ["POST", "PUT", "DELETE"].includes(req.method);
    const isPublicPostEndpoint =
      (req.nextUrl.pathname.startsWith("/api/executive-application") &&
        req.method === "POST") ||
      (req.nextUrl.pathname.startsWith("/api/contact") &&
        req.method === "POST") ||
      (req.nextUrl.pathname.startsWith("/api/subscribe") &&
        req.method === "POST");

    // Allow GET requests to /api/settings without authentication
    if (
      req.nextUrl.pathname.startsWith("/api/settings") &&
      req.method === "GET"
    ) {
      return NextResponse.next();
    }

    // Allow GET requests to /api/executive-roles without authentication
    if (
      req.nextUrl.pathname.startsWith("/api/executive-roles") &&
      req.method === "GET"
    ) {
      return NextResponse.next();
    }

    // If it's a protected API route with a protected method (but not public POST endpoints), check authentication
    if (isProtectedApiRoute && isProtectedMethod && !isPublicPostEndpoint) {
      const token = req.nextauth.token;

      // If no token or user is not authenticated, return 401
      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // For admin-only operations, check if user has admin role
      const adminOnlyRoutes = [
        "/api/executive-application",
        "/api/executive-roles",
        "/api/settings",
        "/api/members",
        "/api/subscribers",
      ];

      const isAdminRoute = adminOnlyRoutes.some((route) =>
        req.nextUrl.pathname.startsWith(route)
      );

      if (isAdminRoute && token.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }
    }

    // For GET requests to protected API routes (except /api/settings), also check authentication
    if (
      isProtectedApiRoute &&
      req.method === "GET" &&
      !req.nextUrl.pathname.startsWith("/api/settings")
    ) {
      const token = req.nextauth.token;

      // If no token or user is not authenticated, return 401
      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // For admin-only operations, check if user has admin role
      const adminOnlyRoutes = [
        "/api/executive-application",
        "/api/executive-roles",
        "/api/members",
        "/api/subscribers",
      ];

      const isAdminRoute = adminOnlyRoutes.some((route) =>
        req.nextUrl.pathname.startsWith(route)
      );

      if (isAdminRoute && token.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // For API routes, we handle authentication in the middleware function above
        // For non-API routes (like dashboard), require authentication
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        return true; // Allow all other routes to pass through
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
    "/api/associateMember/:path*",
    "/api/members/:path*",
    "/api/subscribers/:path*",
    // Protect dashboard routes
    "/dashboard/:path*",
  ],
};
