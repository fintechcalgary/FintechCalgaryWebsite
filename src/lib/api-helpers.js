import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import logger from "@/lib/logger";

/**
 * Standard API response helpers
 */
export const apiResponse = {
  success: (data, status = 200) => {
    return NextResponse.json(data, { status });
  },

  error: (message, status = 500) => {
    return NextResponse.json({ error: message }, { status });
  },

  unauthorized: (message = "Unauthorized") => {
    return NextResponse.json({ error: message }, { status: 401 });
  },

  forbidden: (message = "Admin access required") => {
    return NextResponse.json({ error: message }, { status: 403 });
  },

  notFound: (message = "Resource not found") => {
    return NextResponse.json({ error: message }, { status: 404 });
  },

  badRequest: (message = "Bad request") => {
    return NextResponse.json({ error: message }, { status: 400 });
  },

  methodNotAllowed: (message = "Method not allowed") => {
    return NextResponse.json({ error: message }, { status: 405 });
  },
};

/**
 * Authentication helpers
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, error: apiResponse.unauthorized() };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };

  if (session.user.role !== "admin") {
    return { session: null, error: apiResponse.forbidden() };
  }

  return { session, error: null };
}

/**
 * Validation helpers
 */
export const validators = {
  email: (email) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Invalid email format";
    }
    return null;
  },

  required: (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    return null;
  },

  requiredFields: (data, fields) => {
    const missing = fields.filter((field) => !data[field]);
    if (missing.length > 0) {
      return `Missing required fields: ${missing.join(", ")}`;
    }
    return null;
  },

  array: (value, fieldName) => {
    if (value !== undefined && !Array.isArray(value)) {
      return `${fieldName} must be an array`;
    }
    return null;
  },
};

/**
 * Error handler wrapper for API routes
 */
export function withErrorHandler(handler) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      logger.logApiError(req.nextUrl?.pathname || "unknown", error);
      return apiResponse.error(
        error.message || "Internal server error",
        500
      );
    }
  };
}

/**
 * Default executive application questions
 */
export const DEFAULT_EXECUTIVE_QUESTIONS = [
  {
    id: "why",
    label: "Why do you want to be an executive?",
    placeholder:
      "Please share your motivation for joining the executive team...",
    required: true,
  },
  {
    id: "fintechVision",
    label:
      "What does 'fintech' mean to you, and how do you see its role in the future of business and innovation?",
    placeholder:
      "Please share your understanding of fintech and your vision for its future...",
    required: true,
  },
  {
    id: "otherCommitments",
    label:
      "Are you currently involved with any other clubs or commitments? How do you plan to balance your responsibilities?",
    placeholder:
      "Please describe your current commitments and how you plan to manage your time...",
    required: true,
  },
];

