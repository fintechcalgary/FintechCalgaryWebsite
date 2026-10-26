import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockMessagesCreate } = vi.hoisted(() => ({
  mockMessagesCreate: vi.fn().mockResolvedValue({}),
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

vi.mock("mailgun.js", () => ({
  default: vi.fn(() => ({
    client: vi.fn(() => ({
      messages: { create: mockMessagesCreate },
    })),
  })),
}));

vi.mock("form-data", () => ({ default: vi.fn() }));

vi.mock("@/lib/logger", () => ({
  default: { log: vi.fn(), logUserAction: vi.fn(), logApiError: vi.fn() },
}));

import { POST } from "./route";
import logger from "@/lib/logger";

function createMockRequest(body, method = "POST", url = "http://localhost/api/contact") {
  return {
    json: async () => body,
    method,
    url,
    nextUrl: { pathname: new URL(url).pathname },
  };
}

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Partnership inquiry",
  message: "Hello, I would like to learn more.",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MAILGUN_API_KEY = "test-key";
    process.env.MAILGUN_DOMAIN = "mg.example.com";
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(createMockRequest({ email: "jane@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Missing required fields/);
    expect(mockMessagesCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email", async () => {
    const response = await POST(
      createMockRequest({ ...validBody, email: "not-an-email" }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
    expect(mockMessagesCreate).not.toHaveBeenCalled();
  });

  it("returns 200 and sends email on valid input", async () => {
    const response = await POST(createMockRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockMessagesCreate).toHaveBeenCalledOnce();
    expect(logger.logUserAction).toHaveBeenCalledWith("contact_form_submission", {
      email: validBody.email,
      subject: validBody.subject,
    });
  });

  it("escapes HTML in email content to prevent injection", async () => {
    const maliciousBody = {
      name: '<script>alert("xss")</script>',
      email: "jane@example.com",
      subject: 'Test & "quotes"',
      message: "<img onerror=alert(1)>",
    };

    await POST(createMockRequest(maliciousBody));

    const callArgs = mockMessagesCreate.mock.calls[0];
    const htmlContent = callArgs[1].html;

    expect(htmlContent).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    expect(htmlContent).toContain("Test &amp; &quot;quotes&quot;");
    expect(htmlContent).toContain("&lt;img onerror=alert(1)&gt;");
    expect(htmlContent).not.toContain("<script>");
    expect(htmlContent).not.toContain("<img onerror");
  });
});
