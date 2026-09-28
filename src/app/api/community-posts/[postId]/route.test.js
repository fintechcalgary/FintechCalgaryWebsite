import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";

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
    getCommunityPostById: vi.fn(),
    updateCommunityPost: vi.fn(),
    deleteCommunityPost: vi.fn(),
  };
});

import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import {
  deleteCommunityPost,
  getCommunityPostById,
  updateCommunityPost,
} from "@/lib/models/communityPost";
import { DELETE, GET, PUT } from "./route";
import { USER_ROLES } from "@/lib/constants";

const POST_ID = "507f1f77bcf86cd799439011";

const existingPost = {
  _id: new ObjectId(POST_ID),
  title: "Partner FinTech Night",
  description: "A community meetup",
  eventDate: "2026-10-15",
  eventTime: "6:00 PM MT",
  organizationName: "Calgary Startup Hub",
  location: "Downtown",
  bannerUrl: "",
  registrationUrl: "https://example.com/register",
  createdById: "outreach-1",
};

const validUpdate = {
  title: "Updated Partner Night",
  description: "Updated description",
  eventDate: "2026-10-20",
  eventTime: "7:00 PM MT",
  organizationName: "Calgary Startup Hub",
  location: "Online",
  bannerUrl: "https://res.cloudinary.com/demo/image/upload/banner.jpg",
  registrationUrl: "https://example.com/register-updated",
};

function createContext(postId = POST_ID) {
  return { params: Promise.resolve({ postId }) };
}

function createJsonRequest(body) {
  return new Request(`http://localhost/api/community-posts/${POST_ID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/community-posts/[postId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns a single post without auth", async () => {
    getCommunityPostById.mockResolvedValue(existingPost);

    const res = await GET(new Request("http://localhost"), createContext());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toBe(existingPost.title);
    expect(getServerSession).not.toHaveBeenCalled();
  });

  it("returns 404 when post is missing", async () => {
    getCommunityPostById.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), createContext());
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid post id", async () => {
    const res = await GET(
      new Request("http://localhost"),
      createContext("not-an-id"),
    );
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/community-posts/[postId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns 403 for finance role", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "fin-1", role: USER_ROLES.FINANCE },
    });

    const res = await PUT(createJsonRequest(validUpdate), createContext());
    expect(res.status).toBe(403);
  });

  it("returns 404 when updating a missing post", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "admin-1", role: USER_ROLES.ADMIN },
    });
    getCommunityPostById.mockResolvedValue(null);

    const res = await PUT(createJsonRequest(validUpdate), createContext());
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid update payload", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "admin-1", role: USER_ROLES.ADMIN },
    });
    getCommunityPostById.mockResolvedValue(existingPost);

    const res = await PUT(
      createJsonRequest({ ...validUpdate, registrationUrl: "bad" }),
      createContext(),
    );
    expect(res.status).toBe(400);
  });

  it("updates post for outreach", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "outreach-1", role: USER_ROLES.OUTREACH },
    });
    getCommunityPostById
      .mockResolvedValueOnce(existingPost)
      .mockResolvedValueOnce({ ...existingPost, ...validUpdate });
    updateCommunityPost.mockResolvedValue({ modifiedCount: 1 });

    const res = await PUT(createJsonRequest(validUpdate), createContext());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toBe(validUpdate.title);
    expect(updateCommunityPost).toHaveBeenCalledWith(
      expect.anything(),
      POST_ID,
      expect.objectContaining({ title: validUpdate.title }),
    );
  });
});

describe("DELETE /api/community-posts/[postId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const res = await DELETE(new Request("http://localhost"), createContext());
    expect(res.status).toBe(401);
  });

  it("returns 404 when deleting a missing post", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "admin-1", role: USER_ROLES.ADMIN },
    });
    getCommunityPostById.mockResolvedValue(null);

    const res = await DELETE(new Request("http://localhost"), createContext());
    expect(res.status).toBe(404);
  });

  it("deletes post for admin", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "admin-1", role: USER_ROLES.ADMIN },
    });
    getCommunityPostById.mockResolvedValue(existingPost);
    deleteCommunityPost.mockResolvedValue({ deletedCount: 1 });

    const res = await DELETE(new Request("http://localhost"), createContext());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.deleted).toBe(true);
    expect(deleteCommunityPost).toHaveBeenCalledWith(expect.anything(), POST_ID);
  });
});
