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

vi.mock("@sendgrid/mail", () => ({
  default: { setApiKey: vi.fn(), send: vi.fn().mockResolvedValue({}) },
}));

vi.mock("@/lib/models/event", () => ({
  isUserRegistered: vi.fn(),
  registerForEvent: vi.fn(),
}));

import sgMail from "@sendgrid/mail";
import { connectToDatabase } from "@/lib/mongodb";
import { isUserRegistered, registerForEvent } from "@/lib/models/event";
import { POST } from "./route";

const EVENT_ID = "507f1f77bcf86cd799439011";

function createRegisterRequest(body) {
  return new Request(`http://localhost/api/events/${EVENT_ID}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockDbWithEvent(event) {
  const mockFindOne = vi.fn().mockResolvedValue(event);
  connectToDatabase.mockResolvedValue({
    collection: vi.fn().mockReturnValue({ findOne: mockFindOne }),
  });
  return { mockFindOne };
}

describe("POST /api/events/[eventId]/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when event is not found", async () => {
    mockDbWithEvent(null);

    const res = await POST(
      createRegisterRequest({ email: "user@example.com", name: "User" }),
      { params: Promise.resolve({ eventId: EVENT_ID }) },
    );
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("Event not found");
  });

  it("returns 400 when user is already registered", async () => {
    mockDbWithEvent({ title: "Summit", date: "2025-06-01" });
    isUserRegistered.mockResolvedValue(true);

    const res = await POST(
      createRegisterRequest({ email: "user@example.com", name: "User" }),
      { params: Promise.resolve({ eventId: EVENT_ID }) },
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Already registered for this event");
  });

  it("registers user and sends confirmation email", async () => {
    mockDbWithEvent({ title: "Summit", date: "2025-06-01", time: "10:00" });
    isUserRegistered.mockResolvedValue(false);
    const registrationResult = { success: true, registrationIndex: 0 };
    registerForEvent.mockResolvedValue(registrationResult);

    const res = await POST(
      createRegisterRequest({ email: "user@example.com", name: "Jane Doe" }),
      { params: Promise.resolve({ eventId: EVENT_ID }) },
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(registrationResult);
    expect(registerForEvent).toHaveBeenCalledWith(
      expect.anything(),
      EVENT_ID,
      expect.objectContaining({
        email: "user@example.com",
        userEmail: "user@example.com",
        name: "Jane Doe",
      }),
    );
    expect(sgMail.send).toHaveBeenCalledOnce();
  });
});
