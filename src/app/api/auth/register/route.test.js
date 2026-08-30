import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hashSync: vi.fn(() => "hashed-password"),
  },
}));

import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { POST } from "./route";

const mockFindOne = vi.fn();
const mockInsertOne = vi.fn();

function createMockRequest(body, method = "POST") {
  return { json: async () => body, method, nextUrl: { pathname: "/api/test" } };
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({
      collection: vi.fn(() => ({
        findOne: mockFindOne,
        insertOne: mockInsertOne,
      })),
    });
  });

  it("returns 409 when user already exists", async () => {
    mockFindOne.mockResolvedValue({ email: "existing@example.com" });

    const response = await POST(
      createMockRequest({ email: "existing@example.com", password: "secret123" }),
    );
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe("User already exists");
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it("returns 201 and creates user with hashed password on success", async () => {
    mockFindOne.mockResolvedValue(null);
    mockInsertOne.mockResolvedValue({ insertedId: "user-id" });

    const response = await POST(
      createMockRequest({ email: "new@example.com", password: "secret123" }),
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("User registered");
    expect(bcrypt.hashSync).toHaveBeenCalledWith("secret123", 10);
    expect(mockInsertOne).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "hashed-password",
    });
  });
});
