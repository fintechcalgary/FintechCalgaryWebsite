import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import {
  filterCommunityPosts,
  normalizeCommunityPostPayload,
  serializeCommunityPost,
  toCommunityPostFormState,
  validateCommunityPostPayload,
} from "@/lib/communityPosts";
import {
  createCommunityPost,
  deleteCommunityPost,
  isValidObjectId,
  updateCommunityPost,
} from "@/lib/models/communityPost";

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

describe("serializeCommunityPost", () => {
  it("serializes post fields and ISO date strings", () => {
    const serialized = serializeCommunityPost({
      _id: { toString: () => "post123" },
      ...validPayload,
      createdById: "user-1",
      createdByName: "Outreach",
      createdByRole: "outreach",
      createdAt: new Date("2026-09-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-02T00:00:00.000Z"),
    });

    expect(serialized._id).toBe("post123");
    expect(serialized.title).toBe(validPayload.title);
    expect(serialized.registrationUrl).toBe(validPayload.registrationUrl);
    expect(serialized.createdByRole).toBe("outreach");
    expect(serialized.createdAt).toBe("2026-09-01T00:00:00.000Z");
    expect(serialized.updatedAt).toBe("2026-09-02T00:00:00.000Z");
  });

  it("returns null for missing posts and defaults empty fields", () => {
    expect(serializeCommunityPost(null)).toBeNull();
    expect(serializeCommunityPost({ _id: "abc" })).toMatchObject({
      title: "",
      description: "",
      bannerUrl: "",
      registrationUrl: "",
      createdAt: null,
      updatedAt: null,
    });
  });
});

describe("normalizeCommunityPostPayload", () => {
  it("sanitizes text and trims urls", () => {
    const payload = normalizeCommunityPostPayload({
      title: "  <b>Hello</b>  ",
      description: "Info<script>alert(1)</script>",
      eventDate: "2026-10-15",
      eventTime: " 6pm ",
      organizationName: " Org ",
      location: " Venue ",
      bannerUrl: "  https://example.com/banner.jpg  ",
      registrationUrl: "  https://example.com/register  ",
    });

    expect(payload.title).toBe("Hello");
    expect(payload.description).toBe("Infoalert(1)");
    expect(payload.bannerUrl).toBe("https://example.com/banner.jpg");
    expect(payload.registrationUrl).toBe("https://example.com/register");
  });
});

describe("validateCommunityPostPayload", () => {
  it("accepts a valid payload", () => {
    expect(validateCommunityPostPayload(validPayload)).toBeNull();
  });

  it("requires core fields", () => {
    expect(validateCommunityPostPayload({ ...validPayload, title: "" })).toBe(
      "Title is required",
    );
    expect(
      validateCommunityPostPayload({ ...validPayload, description: "" }),
    ).toBe("Description is required");
    expect(
      validateCommunityPostPayload({ ...validPayload, eventDate: "" }),
    ).toBe("Event date is required");
    expect(
      validateCommunityPostPayload({ ...validPayload, registrationUrl: "" }),
    ).toBe("Registration link is required");
  });

  it("rejects invalid urls", () => {
    expect(
      validateCommunityPostPayload({
        ...validPayload,
        registrationUrl: "not-a-url",
      }),
    ).toMatch(/registration link/i);

    expect(
      validateCommunityPostPayload({
        ...validPayload,
        bannerUrl: "ftp://example.com/banner.jpg",
      }),
    ).toMatch(/banner url/i);

    expect(
      validateCommunityPostPayload({
        ...validPayload,
        bannerUrl: "https://evil.example.com/banner.jpg",
      }),
    ).toMatch(/allowed host/i);
  });

  it("rejects invalid event dates", () => {
    expect(
      validateCommunityPostPayload({ ...validPayload, eventDate: "soon" }),
    ).toMatch(/YYYY-MM-DD/i);
    expect(
      validateCommunityPostPayload({
        ...validPayload,
        eventDate: "2026-13-40",
      }),
    ).toMatch(/YYYY-MM-DD/i);
  });

  it("allows empty optional banner", () => {
    expect(
      validateCommunityPostPayload({ ...validPayload, bannerUrl: "" }),
    ).toBeNull();
  });
});

describe("toCommunityPostFormState", () => {
  it("returns empty form state by default", () => {
    expect(toCommunityPostFormState()).toEqual({
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      organizationName: "",
      location: "",
      bannerUrl: "",
      registrationUrl: "",
    });
  });

  it("maps an existing post into form values", () => {
    expect(
      toCommunityPostFormState({
        ...validPayload,
        eventDate: "2026-10-15T00:00:00.000Z",
      }),
    ).toMatchObject({
      title: validPayload.title,
      eventDate: "2026-10-15",
      registrationUrl: validPayload.registrationUrl,
    });
  });
});

describe("filterCommunityPosts", () => {
  const today = new Date(2026, 8, 27);
  const posts = [
    { _id: "1", title: "Past", eventDate: "2026-09-01" },
    { _id: "2", title: "Soon", eventDate: "2026-10-01" },
    { _id: "3", title: "Later", eventDate: "2026-11-01" },
    { _id: "4", title: "No date" },
  ];

  it("filters upcoming posts and sorts ascending", () => {
    expect(filterCommunityPosts(posts, "upcoming", today).map((p) => p._id)).toEqual([
      "2",
      "3",
    ]);
  });

  it("filters past posts and sorts descending", () => {
    expect(filterCommunityPosts(posts, "past", today).map((p) => p._id)).toEqual([
      "1",
    ]);
  });

  it("returns all dated posts for all filter and includes undated", () => {
    expect(filterCommunityPosts(posts, "all", today).map((p) => p._id)).toEqual([
      "4",
      "1",
      "2",
      "3",
    ]);
  });
});

describe("isValidObjectId", () => {
  it("accepts valid ObjectIds only", () => {
    expect(isValidObjectId("507f1f77bcf86cd799439011")).toBe(true);
    expect(isValidObjectId("not-an-id")).toBe(false);
    expect(isValidObjectId("")).toBe(false);
    expect(isValidObjectId(null)).toBe(false);
  });
});

describe("community post db helpers", () => {
  let collection;
  let db;

  beforeEach(() => {
    collection = {
      insertOne: vi.fn(),
      updateOne: vi.fn(),
      deleteOne: vi.fn(),
    };
    db = { collection: vi.fn().mockReturnValue(collection) };
  });

  it("creates a post with timestamps", async () => {
    const insertedId = new ObjectId();
    collection.insertOne.mockResolvedValue({ insertedId });

    const created = await createCommunityPost(db, {
      ...validPayload,
      createdById: "user-1",
      createdByName: "outreach",
      createdByRole: "outreach",
    });

    expect(created._id).toBe(insertedId);
    expect(created.createdById).toBe("user-1");
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);
  });

  it("updates only allowed fields", async () => {
    collection.updateOne.mockResolvedValue({ modifiedCount: 1 });
    const postId = "507f1f77bcf86cd799439011";

    await updateCommunityPost(db, postId, {
      title: "Updated",
      createdById: "should-ignore",
    });

    const setArg = collection.updateOne.mock.calls[0][1].$set;
    expect(setArg).toEqual(
      expect.objectContaining({
        title: "Updated",
        updatedAt: expect.any(Date),
      }),
    );
    expect(setArg.createdById).toBeUndefined();
  });

  it("deletes by id", async () => {
    collection.deleteOne.mockResolvedValue({ deletedCount: 1 });
    const postId = "507f1f77bcf86cd799439011";

    await deleteCommunityPost(db, postId);
    expect(collection.deleteOne).toHaveBeenCalledWith({
      _id: new ObjectId(postId),
    });
  });
});
