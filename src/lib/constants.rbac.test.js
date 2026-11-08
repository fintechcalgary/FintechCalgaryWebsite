import { describe, it, expect } from "vitest";
import {
  API_ENDPOINTS,
  COLLECTIONS,
  MARKETING_APPROVAL_STATUS,
  FILE_TYPES,
  USER_ROLES,
  STAFF_ROLE_LABELS,
  UPLOAD_FOLDERS,
  PARTNER_APPLICATION_STATUS,
  EVENT_TYPE,
} from "@/lib/constants";

describe("RBAC constants", () => {
  it("defines all staff roles with labels", () => {
    expect(STAFF_ROLE_LABELS[USER_ROLES.ADMIN]).toBe("Admin");
    expect(STAFF_ROLE_LABELS[USER_ROLES.OUTREACH]).toBe("Outreach");
    expect(STAFF_ROLE_LABELS[USER_ROLES.FINANCE]).toBe("Finance");
    expect(STAFF_ROLE_LABELS[USER_ROLES.EVENTS]).toBe("Events");
    expect(STAFF_ROLE_LABELS[USER_ROLES.MARKETING]).toBe("Marketing");
    expect(STAFF_ROLE_LABELS[USER_ROLES.PROJECTS]).toBe("Projects");
  });

  it("defines marketing approval workflow statuses", () => {
    expect(MARKETING_APPROVAL_STATUS.PENDING).toBe("pending");
    expect(MARKETING_APPROVAL_STATUS.APPROVED).toBe("approved");
    expect(MARKETING_APPROVAL_STATUS.REJECTED).toBe("rejected");
  });

  it("allows Excel and Word files for finance uploads", () => {
    expect(FILE_TYPES.FINANCE.EXTENSIONS).toContain("xlsx");
    expect(FILE_TYPES.FINANCE.EXTENSIONS).toContain("docx");
    expect(FILE_TYPES.FINANCE.EXTENSIONS).toContain("pdf");
  });

  it("allows email proof files for marketing submissions", () => {
    expect(FILE_TYPES.MARKETING.EXTENSIONS).toContain("eml");
    expect(FILE_TYPES.MARKETING.EXTENSIONS).toContain("pdf");
  });

  it("defines partner application status distinct from executive approved", () => {
    expect(PARTNER_APPLICATION_STATUS.ACCEPTED).toBe("accepted");
    expect(PARTNER_APPLICATION_STATUS.PENDING).toBe("pending");
    expect(EVENT_TYPE.WEBINAR).toBe("webinar");
    expect(API_ENDPOINTS.CHAT).toBe("/api/chat");
    expect(API_ENDPOINTS.PARTNERS_ORDER).toBe("/api/partners/order");
  });

  it("defines community posts API and collection constants", () => {
    expect(API_ENDPOINTS.COMMUNITY_POSTS).toBe("/api/community-posts");
    expect(COLLECTIONS.COMMUNITY_POSTS).toBe("communityPosts");
    expect(UPLOAD_FOLDERS.COMMUNITY_BANNERS).toBe("communityBanners");
  });
});
