import { describe, it, expect } from "vitest";
import {
  MARKETING_APPROVAL_STATUS,
  FILE_TYPES,
  USER_ROLES,
  STAFF_ROLE_LABELS,
} from "@/lib/constants";

describe("RBAC constants", () => {
  it("defines all five staff roles with labels", () => {
    expect(STAFF_ROLE_LABELS[USER_ROLES.ADMIN]).toBe("Admin");
    expect(STAFF_ROLE_LABELS[USER_ROLES.OUTREACH]).toBe("Outreach");
    expect(STAFF_ROLE_LABELS[USER_ROLES.FINANCE]).toBe("Finance");
    expect(STAFF_ROLE_LABELS[USER_ROLES.EVENTS]).toBe("Events");
    expect(STAFF_ROLE_LABELS[USER_ROLES.MARKETING]).toBe("Marketing");
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
});
