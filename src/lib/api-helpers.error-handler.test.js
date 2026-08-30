import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("@/lib/logger", () => ({
  default: {
    logApiError: vi.fn(),
  },
}));

import logger from "@/lib/logger";
import { withErrorHandler, apiResponse } from "@/lib/api-helpers";

describe("withErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns handler result on success", async () => {
    const handler = vi.fn(async () => apiResponse.success({ data: "ok" }));
    const wrapped = withErrorHandler(handler);

    const req = { nextUrl: { pathname: "/api/test" } };
    const res = await wrapped(req, {});

    expect(handler).toHaveBeenCalledWith(req, {});
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: "ok" });
    expect(logger.logApiError).not.toHaveBeenCalled();
  });

  it("catches errors and returns 500 with error message", async () => {
    const handler = vi.fn(async () => {
      throw new Error("Database connection failed");
    });
    const wrapped = withErrorHandler(handler);

    const req = { nextUrl: { pathname: "/api/events" } };
    const res = await wrapped(req, {});

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Database connection failed");
    expect(logger.logApiError).toHaveBeenCalledWith(
      "/api/events",
      expect.objectContaining({ message: "Database connection failed" }),
    );
  });

  it("uses fallback message when error has no message", async () => {
    const handler = vi.fn(async () => {
      throw new Error();
    });
    const wrapped = withErrorHandler(handler);

    const req = { nextUrl: { pathname: "/api/unknown" } };
    const res = await wrapped(req, {});

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
    expect(logger.logApiError).toHaveBeenCalledWith(
      "/api/unknown",
      expect.any(Error),
    );
  });

  it("logs unknown pathname when nextUrl is missing", async () => {
    const handler = vi.fn(async () => {
      throw new Error("Unexpected failure");
    });
    const wrapped = withErrorHandler(handler);

    const req = {};
    await wrapped(req, {});

    expect(logger.logApiError).toHaveBeenCalledWith(
      "unknown",
      expect.objectContaining({ message: "Unexpected failure" }),
    );
  });
});
