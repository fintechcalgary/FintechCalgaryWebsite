import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";

const mockCollections = {
  settings: { findOne: vi.fn() },
  executiveRoles: { findOne: vi.fn() },
  executiveApplications: {
    insertOne: vi.fn(),
    find: vi.fn(),
    deleteOne: vi.fn(),
  },
};

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

import { connectToDatabase } from "@/lib/mongodb";
import { POST, GET, DELETE } from "./route";
import logger from "@/lib/logger";

function createMockRequest(body, method = "POST", url = "http://localhost/api/executive-application") {
  return {
    json: async () => body,
    method,
    url,
    nextUrl: { pathname: new URL(url).pathname },
  };
}

const validBody = {
  name: "John Doe",
  email: "john@example.com",
  program: "Computer Science",
  year: "3",
  role: "President",
  why: "I want to lead the executive team.",
  fintechVision: "Fintech drives innovation in financial services.",
  otherCommitments: "I balance club work with part-time employment.",
};

function setupMockDb() {
  mockCollections.settings.findOne.mockResolvedValue(null);
  mockCollections.executiveRoles.findOne.mockResolvedValue(null);
  mockCollections.executiveApplications.insertOne.mockResolvedValue({ insertedId: new ObjectId() });
  mockCollections.executiveApplications.deleteOne.mockResolvedValue({ deletedCount: 0 });

  connectToDatabase.mockResolvedValue({
    collection: vi.fn((name) => {
      if (name === "settings") return mockCollections.settings;
      if (name === "executiveRoles") return mockCollections.executiveRoles;
      if (name === "executiveApplications") return mockCollections.executiveApplications;
      throw new Error(`Unexpected collection: ${name}`);
    }),
  });
}

describe("POST /api/executive-application", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockDb();
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(createMockRequest({ email: "john@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Missing required fields/);
    expect(mockCollections.executiveApplications.insertOne).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email", async () => {
    const response = await POST(
      createMockRequest({ ...validBody, email: "not-valid" }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
    expect(mockCollections.executiveApplications.insertOne).not.toHaveBeenCalled();
  });

  it("returns 400 when default executive questions are missing", async () => {
    const { why: _why, ...bodyWithoutWhy } = validBody;
    const response = await POST(createMockRequest(bodyWithoutWhy));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Missing required questions/);
    expect(data.error).toContain("Why do you want to be an executive?");
    expect(mockCollections.executiveApplications.insertOne).not.toHaveBeenCalled();
  });

  it("returns 200 and inserts application on valid input", async () => {
    const response = await POST(createMockRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockCollections.executiveApplications.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        name: validBody.name,
        email: validBody.email,
        role: validBody.role,
        createdAt: expect.any(Date),
      }),
    );
    expect(logger.logUserAction).toHaveBeenCalledWith("submit_executive_application", {
      role: validBody.role,
    });
  });
});

describe("GET /api/executive-application", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockDb();
  });

  it("returns applications list sorted by createdAt descending", async () => {
    const applications = [
      { _id: new ObjectId(), name: "Alice", createdAt: new Date("2026-01-02") },
      { _id: new ObjectId(), name: "Bob", createdAt: new Date("2026-01-01") },
    ];

    mockCollections.executiveApplications.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(applications),
      }),
    });

    const response = await GET(createMockRequest(null, "GET"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({
      _id: applications[0]._id.toString(),
      name: "Alice",
      createdAt: applications[0].createdAt.toISOString(),
    });
    expect(data[1]).toEqual({
      _id: applications[1]._id.toString(),
      name: "Bob",
      createdAt: applications[1].createdAt.toISOString(),
    });
    expect(mockCollections.executiveApplications.find).toHaveBeenCalledWith({});
  });
});

describe("DELETE /api/executive-application", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockDb();
  });

  it("returns 400 when id param is missing", async () => {
    const response = await DELETE(
      createMockRequest(null, "DELETE", "http://localhost/api/executive-application"),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Application ID is required");
    expect(mockCollections.executiveApplications.deleteOne).not.toHaveBeenCalled();
  });

  it("returns 404 when application is not found", async () => {
    const id = new ObjectId().toString();
    mockCollections.executiveApplications.deleteOne.mockResolvedValue({ deletedCount: 0 });

    const response = await DELETE(
      createMockRequest(null, "DELETE", `http://localhost/api/executive-application?id=${id}`),
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Application not found");
    expect(mockCollections.executiveApplications.deleteOne).toHaveBeenCalledWith({
      _id: new ObjectId(id),
    });
  });

  it("returns 200 when application is deleted", async () => {
    const id = new ObjectId().toString();
    mockCollections.executiveApplications.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const response = await DELETE(
      createMockRequest(null, "DELETE", `http://localhost/api/executive-application?id=${id}`),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });
});
