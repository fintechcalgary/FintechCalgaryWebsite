import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({}),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock("@sendgrid/mail", () => ({
  default: { setApiKey: vi.fn(), send: mockSend },
}));

vi.mock("@/lib/logger", () => ({
  default: { log: vi.fn(), logUserAction: vi.fn(), logApiError: vi.fn() },
}));

import { POST } from "./route";
import logger from "@/lib/logger";

function createMockRequest(body, method = "POST", url = "http://localhost/api/subscribe") {
  return {
    json: async () => body,
    method,
    url,
    nextUrl: { pathname: new URL(url).pathname },
  };
}

const validBody = {
  firstName: "Jane",
  lastName: "Doe",
  ucid: "12345678",
  email: "jane@example.com",
  resume: "https://example.com/resume.pdf",
};

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SENDGRID_API_KEY = "test-key";
    mockSend.mockResolvedValue({});
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(createMockRequest({ email: "jane@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Missing required fields/);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email", async () => {
    const response = await POST(
      createMockRequest({ ...validBody, email: "invalid-email" }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 when resume is missing", async () => {
    const { resume: _resume, ...bodyWithoutResume } = validBody;
    const response = await POST(createMockRequest(bodyWithoutResume));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Resume is required");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 200 on valid input and sends welcome email", async () => {
    const response = await POST(createMockRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledOnce();
    expect(logger.logUserAction).toHaveBeenCalledWith("subscribe", {
      email: validBody.email,
      firstName: validBody.firstName,
      lastName: validBody.lastName,
      ucid: validBody.ucid,
      membership_type: "free",
      has_paid: false,
    });
  });

  it("returns 200 even when email sending fails", async () => {
    mockSend.mockRejectedValueOnce(new Error("SendGrid unavailable"));

    const response = await POST(createMockRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(logger.log).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ type: "email_error", endpoint: "/api/subscribe" }),
    );
    expect(logger.logUserAction).toHaveBeenCalled();
  });
});
