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

vi.mock("@/lib/models/event", () => ({
  createEvent: vi.fn(),
}));

import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import { createEvent } from "@/lib/models/event";
import { GET, POST } from "./route";
import { USER_ROLES } from "@/lib/constants";

function createJsonRequest(body) {
  return new Request("http://localhost/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockEventsCollection(events = []) {
  const mockToArray = vi.fn().mockResolvedValue(events);
  const mockSort = vi.fn().mockReturnValue({ toArray: mockToArray });
  const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
  connectToDatabase.mockResolvedValue({
    collection: vi.fn().mockReturnValue({ find: mockFind }),
  });
  return { mockFind, mockSort, mockToArray };
}

describe("GET /api/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns events list without auth", async () => {
    const events = [{ title: "FinTech Summit", date: "2025-06-01" }];
    mockEventsCollection(events);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(events);
    expect(getServerSession).not.toHaveBeenCalled();
  });
});

describe("POST /api/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({ collection: vi.fn() });
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const res = await POST(
      createJsonRequest({
        title: "Event",
        description: "Desc",
        date: "2025-06-01",
        time: "10:00",
        isPartner: false,
      }),
    );

    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks EVENTS permission", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.OUTREACH } });

    const res = await POST(
      createJsonRequest({
        title: "Event",
        description: "Desc",
        date: "2025-06-01",
        time: "10:00",
        isPartner: false,
      }),
    );

    expect(res.status).toBe(403);
  });

  it("returns 400 when required fields are missing", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "user-1", role: USER_ROLES.EVENTS },
    });

    const res = await POST(createJsonRequest({ title: "Event only" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Missing required fields/);
  });

  it("creates event when authorized with valid payload", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "user-1", role: USER_ROLES.EVENTS },
    });
    const created = { insertedId: "507f1f77bcf86cd799439011" };
    createEvent.mockResolvedValue(created);

    const payload = {
      title: "FinTech Summit",
      description: "Annual summit",
      date: "2025-06-01",
      time: "10:00",
      isPartner: false,
    };

    const res = await POST(createJsonRequest(payload));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual(created);
    expect(createEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ ...payload, ownerId: "user-1" }),
    );
  });
});
