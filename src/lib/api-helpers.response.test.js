import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

import { apiResponse } from "@/lib/api-helpers";

describe("apiResponse.success", () => {
  it("returns 200 with data by default", async () => {
    const res = apiResponse.success({ ok: true });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it("returns a custom status when provided", async () => {
    const res = apiResponse.success({ created: true }, 201);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ created: true });
  });
});

describe("apiResponse.error", () => {
  it("returns 500 with error message by default", async () => {
    const res = apiResponse.error("Something went wrong");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Something went wrong");
  });

  it("returns a custom status when provided", async () => {
    const res = apiResponse.error("Conflict", 409);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("Conflict");
  });
});

describe("apiResponse.unauthorized", () => {
  it("returns 401 with default message", async () => {
    const res = apiResponse.unauthorized();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 with custom message", async () => {
    const res = apiResponse.unauthorized("Please log in");
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Please log in");
  });
});

describe("apiResponse.forbidden", () => {
  it("returns 403 with default message", async () => {
    const res = apiResponse.forbidden();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Access denied");
  });

  it("returns 403 with custom message", async () => {
    const res = apiResponse.forbidden("Admin only");
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Admin only");
  });
});

describe("apiResponse.notFound", () => {
  it("returns 404 with default message", async () => {
    const res = apiResponse.notFound();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Resource not found");
  });

  it("returns 404 with custom message", async () => {
    const res = apiResponse.notFound("Event not found");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Event not found");
  });
});

describe("apiResponse.badRequest", () => {
  it("returns 400 with default message", async () => {
    const res = apiResponse.badRequest();
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad request");
  });

  it("returns 400 with custom message", async () => {
    const res = apiResponse.badRequest("Invalid input");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid input");
  });
});

describe("apiResponse.methodNotAllowed", () => {
  it("returns 405 with default message", async () => {
    const res = apiResponse.methodNotAllowed();
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toBe("Method not allowed");
  });

  it("returns 405 with custom message", async () => {
    const res = apiResponse.methodNotAllowed("POST only");
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toBe("POST only");
  });
});
