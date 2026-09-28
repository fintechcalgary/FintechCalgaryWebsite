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

vi.mock("@/lib/models/communityPost", async () => {
  const actual = await vi.importActual("@/lib/models/communityPost");
  return {
    ...actual,
    createCommunityPost: vi.fn(),
    getCommunityPosts: vi.fn(),
  };
});

import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import {
  createCommunityPost,
  getCommunityPosts,
} from "@/lib/models/communityPost";
import { GET, POST } from "./route";
import { USER_ROLES } from "@/lib/constants";

function createJsonRequest(body) {
  return new Request("http://localhost/api/community-posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  title: "Partner FinTech Night",
  description: "A community meetup for Calgary fintech builders.",
  eventDate: "2026-10-15",
  eventTime: "6:00 PM MT",
  organizationName: "Calgary Startup Hub",
  location: "Downtown Calgary",
  bannerUrl: "https://res.cloudinary.com/demo/image/upload/banner.jpg",
  registrationUrl: "https://example.com/register",
};

describe("GET /api/community-posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns serialized posts without auth", async () => {
    const posts = [
      {
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        title: "Community Meetup",
        description: "Join us",
        eventDate: "2026-10-01",
        registrationUrl: "https://example.com",
      },
    ];
    getCommunityPosts.mockResolvedValue(posts);
    connectToDatabase.mockResolvedValue({});

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("Community Meetup");
    expect(getServerSession).not.toHaveBeenCalled();
  });
});

describe("POST /api/community-posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await POST(createJsonRequest(validPayload));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks COMMUNITY permission", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "user-1", role: USER_ROLES.EVENTS },
    });
    const res = await POST(createJsonRequest(validPayload));
    expect(res.status).toBe(403);
  });

  it("allows outreach to create posts", async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: "outreach-1",
        role: USER_ROLES.OUTREACH,
        username: "Outreach Lead",
      },
    });
    createCommunityPost.mockResolvedValue({
      ...validPayload,
      _id: { toString: () => "507f1f77bcf86cd799439011" },
      createdById: "outreach-1",
      createdByName: "Outreach Lead",
      createdByRole: USER_ROLES.OUTREACH,
    });

    const res = await POST(createJsonRequest(validPayload));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.title).toBe(validPayload.title);
    expect(createCommunityPost).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: validPayload.title,
        registrationUrl: validPayload.registrationUrl,
        createdById: "outreach-1",
        createdByName: "Outreach Lead",
        createdByRole: USER_ROLES.OUTREACH,
      }),
    );
  });

  it("allows admin to create posts", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "admin-1", role: USER_ROLES.ADMIN, username: "Admin" },
    });
    createCommunityPost.mockResolvedValue({
      ...validPayload,
      _id: { toString: () => "507f1f77bcf86cd799439012" },
      createdById: "admin-1",
    });

    const res = await POST(createJsonRequest(validPayload));
    expect(res.status).toBe(201);
  });

  it("returns 400 when required fields are missing", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "admin-1", role: USER_ROLES.ADMIN },
    });

    const res = await POST(createJsonRequest({ title: "Only title" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/required/i);
  });

  it("returns 400 for invalid registration URL", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "admin-1", role: USER_ROLES.ADMIN },
    });

    const res = await POST(
      createJsonRequest({
        ...validPayload,
        registrationUrl: "not-a-url",
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/registration link/i);
  });

  it("returns 400 for invalid banner URL", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "admin-1", role: USER_ROLES.ADMIN },
    });

    const res = await POST(
      createJsonRequest({
        ...validPayload,
        bannerUrl: "javascript:alert(1)",
      }),
    );

    expect(res.status).toBe(400);
  });

  it("allows posts without a banner", async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: "outreach-1",
        role: USER_ROLES.OUTREACH,
        username: "Outreach",
      },
    });
    createCommunityPost.mockResolvedValue({
      ...validPayload,
      bannerUrl: "",
      _id: { toString: () => "507f1f77bcf86cd799439013" },
    });

    const { bannerUrl: _bannerUrl, ...withoutBanner } = validPayload;
    const res = await POST(createJsonRequest(withoutBanner));

    expect(res.status).toBe(201);
    expect(createCommunityPost).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ bannerUrl: "" }),
    );
  });
});
