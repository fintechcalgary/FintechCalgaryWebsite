import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  default: { log: vi.fn(), logUserAction: vi.fn(), logApiError: vi.fn() },
}));

vi.mock("@/lib/models/partner", () => ({
  getPartners: vi.fn().mockResolvedValue([]),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(() => Promise.resolve("hashed-password")),
  },
}));

import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import { getPartners } from "@/lib/models/partner";
import bcrypt from "bcryptjs";
import { POST, GET } from "./route";
import { COLLECTIONS, ERROR_MESSAGES, USER_ROLES } from "@/lib/constants";

const partnerApplicationsFindOne = vi.fn();
const partnerApplicationsInsertOne = vi.fn();
const usersFindOne = vi.fn();
const usersInsertOne = vi.fn();

function createMockRequest(body, method = "POST") {
  return { json: async () => body, method, nextUrl: { pathname: "/api/test" } };
}

function createValidOrganization(overrides = {}) {
  return {
    organizationName: "Acme Corp",
    username: "acmeuser",
    password: "secret123",
    organizationEmail: "contact@acme.com",
    ...overrides,
  };
}

function setupDbMocks() {
  connectToDatabase.mockResolvedValue({
    collection: vi.fn((name) => {
      if (name === COLLECTIONS.PARTNER_APPLICATIONS) {
        return {
          findOne: partnerApplicationsFindOne,
          insertOne: partnerApplicationsInsertOne,
        };
      }
      if (name === COLLECTIONS.USERS) {
        return {
          findOne: usersFindOne,
          insertOne: usersInsertOne,
        };
      }
      return { findOne: vi.fn(), insertOne: vi.fn() };
    }),
  });
}

describe("POST /api/partner-applications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDbMocks();
    partnerApplicationsFindOne.mockResolvedValue(null);
    usersFindOne.mockResolvedValue(null);
    partnerApplicationsInsertOne.mockResolvedValue({ insertedId: "app-id" });
    usersInsertOne.mockResolvedValue({ insertedId: "user-id" });
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(createMockRequest({ organizationName: "Acme Corp" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing required fields");
    expect(data.error).toContain("username");
    expect(data.error).toContain("password");
  });

  it("returns 400 when password is too short", async () => {
    const response = await POST(
      createMockRequest(createValidOrganization({ password: "abc" })),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(ERROR_MESSAGES.PASSWORD_MIN_LENGTH);
  });

  it("returns 400 when username is too short", async () => {
    const response = await POST(
      createMockRequest(createValidOrganization({ username: "ab" })),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(ERROR_MESSAGES.USERNAME_MIN_LENGTH);
  });

  it("returns 400 when organization already exists", async () => {
    partnerApplicationsFindOne.mockResolvedValue({ organizationName: "Acme Corp" });

    const response = await POST(createMockRequest(createValidOrganization()));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(ERROR_MESSAGES.ORGANIZATION_EXISTS);
    expect(partnerApplicationsInsertOne).not.toHaveBeenCalled();
  });

  it("returns 400 when username already exists", async () => {
    usersFindOne.mockResolvedValue({ username: "acmeuser" });

    const response = await POST(createMockRequest(createValidOrganization()));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(ERROR_MESSAGES.USERNAME_EXISTS);
    expect(partnerApplicationsInsertOne).not.toHaveBeenCalled();
  });

  it("returns 201 and hashes password on success", async () => {
    const organization = createValidOrganization();

    const response = await POST(createMockRequest(organization));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
    expect(partnerApplicationsInsertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationName: organization.organizationName,
        username: organization.username,
        password: "hashed-password",
        role: "associate",
        approvalStatus: "pending",
      }),
    );
    expect(usersInsertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        username: organization.username,
        email: organization.organizationEmail,
        password: "hashed-password",
        role: "associate",
      }),
    );
    expect(data.insertedId).toBe("app-id");
  });
});

describe("GET /api/partner-applications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDbMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const response = await GET(createMockRequest(null, "GET"));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(getPartners).not.toHaveBeenCalled();
  });

  it("returns 403 when user lacks PARTNERS permission", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.EVENTS } });

    const response = await GET(createMockRequest(null, "GET"));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Access denied");
    expect(getPartners).not.toHaveBeenCalled();
  });

  it("returns 200 with partners when user has PARTNERS permission", async () => {
    const mockPartners = [{ organizationName: "Acme Corp" }];
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.MARKETING } });
    getPartners.mockResolvedValue(mockPartners);

    const response = await GET(createMockRequest(null, "GET"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockPartners);
    expect(getPartners).toHaveBeenCalled();
  });
});
