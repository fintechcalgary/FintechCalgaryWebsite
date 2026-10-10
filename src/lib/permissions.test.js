import { describe, it, expect } from "vitest";
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  STAFF_ROLES,
  canAccessApiRoute,
  canAccessDashboardRoute,
  canManageDocumentation,
  canManageDocumentationFolder,
  getAdminPanelCards,
  getDashboardNavItems,
  getPermissionsForRole,
  getPostLoginDestination,
  hasAnyPermission,
  hasPermission,
  isAdmin,
  isStaffRole,
} from "@/lib/permissions";
import { USER_ROLES } from "@/lib/constants";

describe("permissions", () => {
  describe("isStaffRole", () => {
    it("returns true for all staff roles", () => {
      expect(isStaffRole(USER_ROLES.ADMIN)).toBe(true);
      expect(isStaffRole(USER_ROLES.OUTREACH)).toBe(true);
      expect(isStaffRole(USER_ROLES.FINANCE)).toBe(true);
      expect(isStaffRole(USER_ROLES.EVENTS)).toBe(true);
      expect(isStaffRole(USER_ROLES.MARKETING)).toBe(true);
      expect(isStaffRole(USER_ROLES.PROJECTS)).toBe(true);
      expect(STAFF_ROLES).toHaveLength(6);
    });

    it("returns false for associate and member", () => {
      expect(isStaffRole(USER_ROLES.ASSOCIATE)).toBe(false);
      expect(isStaffRole(USER_ROLES.MEMBER)).toBe(false);
    });
  });

  describe("getPostLoginDestination", () => {
    it("sends associates to the partner dashboard", () => {
      expect(getPostLoginDestination(USER_ROLES.ASSOCIATE)).toBe(
        "/partner-dashboard",
      );
    });

    it("sends projects users to executive applications", () => {
      expect(getPostLoginDestination(USER_ROLES.PROJECTS)).toBe(
        "/dashboard/executive-applications",
      );
    });

    it("sends other staff to the main dashboard", () => {
      expect(getPostLoginDestination(USER_ROLES.ADMIN)).toBe("/dashboard");
      expect(getPostLoginDestination(USER_ROLES.OUTREACH)).toBe("/dashboard");
      expect(getPostLoginDestination(USER_ROLES.MARKETING)).toBe("/dashboard");
    });

    it("returns null for unknown roles", () => {
      expect(getPostLoginDestination(USER_ROLES.MEMBER)).toBeNull();
      expect(getPostLoginDestination(undefined)).toBeNull();
    });
  });

  describe("hasPermission", () => {
    it("grants admin full access", () => {
      expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.CONTRACTS)).toBe(true);
      expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.USERS)).toBe(true);
      expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.MARKETING_APPROVE)).toBe(
        true,
      );
    });

    it("grants outreach contracts, community, and partners access", () => {
      expect(hasPermission(USER_ROLES.OUTREACH, PERMISSIONS.CONTRACTS)).toBe(true);
      expect(hasPermission(USER_ROLES.OUTREACH, PERMISSIONS.COMMUNITY)).toBe(true);
      expect(hasPermission(USER_ROLES.OUTREACH, PERMISSIONS.PARTNERS)).toBe(true);
      expect(hasPermission(USER_ROLES.OUTREACH, PERMISSIONS.EVENTS)).toBe(false);
    });

    it("grants finance documentation access", () => {
      expect(hasPermission(USER_ROLES.FINANCE, PERMISSIONS.DOCUMENTATION)).toBe(
        true,
      );
      expect(
        hasPermission(USER_ROLES.FINANCE, PERMISSIONS.DOCUMENTATION_FINANCE),
      ).toBe(true);
      expect(hasPermission(USER_ROLES.FINANCE, PERMISSIONS.CONTRACTS)).toBe(
        false,
      );
    });

    it("scopes documentation folder management by role", () => {
      expect(canManageDocumentation(USER_ROLES.ADMIN)).toBe(true);
      expect(canManageDocumentation(USER_ROLES.FINANCE)).toBe(false);
      expect(
        canManageDocumentationFolder(USER_ROLES.FINANCE, "finance"),
      ).toBe(true);
      expect(
        canManageDocumentationFolder(
          USER_ROLES.FINANCE,
          "partnership-agreements",
        ),
      ).toBe(false);
      expect(
        canManageDocumentationFolder(
          USER_ROLES.ADMIN,
          "partnership-agreements",
        ),
      ).toBe(true);
    });

    it("grants events role events access only", () => {
      expect(hasPermission(USER_ROLES.EVENTS, PERMISSIONS.EVENTS)).toBe(true);
      expect(hasPermission(USER_ROLES.EVENTS, PERMISSIONS.CONTRACTS)).toBe(
        false,
      );
    });

    it("grants marketing partners and submit access", () => {
      expect(hasPermission(USER_ROLES.MARKETING, PERMISSIONS.PARTNERS)).toBe(
        true,
      );
      expect(hasPermission(USER_ROLES.MARKETING, PERMISSIONS.MARKETING_SUBMIT)).toBe(
        true,
      );
      expect(
        hasPermission(USER_ROLES.MARKETING, PERMISSIONS.MARKETING_APPROVE),
      ).toBe(false);
    });

    it("grants projects executive applications access only", () => {
      expect(
        hasPermission(USER_ROLES.PROJECTS, PERMISSIONS.EXECUTIVE_APPLICATIONS),
      ).toBe(true);
      expect(hasPermission(USER_ROLES.PROJECTS, PERMISSIONS.EXECUTIVES)).toBe(
        false,
      );
      expect(hasPermission(USER_ROLES.PROJECTS, PERMISSIONS.PARTNERS)).toBe(
        false,
      );
      expect(hasPermission(USER_ROLES.PROJECTS, PERMISSIONS.CONTRACTS)).toBe(
        false,
      );
      expect(
        hasPermission(USER_ROLES.PROJECTS, PERMISSIONS.MARKETING_SUBMIT),
      ).toBe(false);
    });
  });

  describe("canAccessDashboardRoute", () => {
    it("allows outreach to access contracts", () => {
      expect(
        canAccessDashboardRoute(USER_ROLES.OUTREACH, "/dashboard/contracts"),
      ).toBe(true);
    });

    it("applies parent route permissions to nested dashboard paths", () => {
      expect(
        canAccessDashboardRoute(
          USER_ROLES.PROJECTS,
          "/dashboard/executive-applications/abc123",
        ),
      ).toBe(true);
      expect(
        canAccessDashboardRoute(
          USER_ROLES.EVENTS,
          "/dashboard/executive-applications/abc123",
        ),
      ).toBe(false);
    });

    it("denies events role from contracts", () => {
      expect(
        canAccessDashboardRoute(USER_ROLES.EVENTS, "/dashboard/contracts"),
      ).toBe(false);
    });

    it("allows finance to access documentation", () => {
      expect(
        canAccessDashboardRoute(
          USER_ROLES.FINANCE,
          "/dashboard/documentation",
        ),
      ).toBe(true);
    });

    it("allows marketing to access partners and submissions", () => {
      expect(
        canAccessDashboardRoute(USER_ROLES.MARKETING, "/dashboard/partners"),
      ).toBe(true);
      expect(
        canAccessDashboardRoute(
          USER_ROLES.MARKETING,
          "/dashboard/marketing-submissions",
        ),
      ).toBe(true);
    });

    it("allows admin to access marketing approvals", () => {
      expect(
        canAccessDashboardRoute(
          USER_ROLES.ADMIN,
          "/dashboard/marketing-approvals",
        ),
      ).toBe(true);
    });

    it("denies marketing from admin approval page", () => {
      expect(
        canAccessDashboardRoute(
          USER_ROLES.MARKETING,
          "/dashboard/marketing-approvals",
        ),
      ).toBe(false);
    });

    it("allows projects to access executive applications only", () => {
      expect(
        canAccessDashboardRoute(
          USER_ROLES.PROJECTS,
          "/dashboard/executive-applications",
        ),
      ).toBe(true);
      expect(
        canAccessDashboardRoute(USER_ROLES.PROJECTS, "/dashboard/partners"),
      ).toBe(false);
      expect(
        canAccessDashboardRoute(USER_ROLES.PROJECTS, "/dashboard/contracts"),
      ).toBe(false);
    });
  });

  describe("canAccessApiRoute", () => {
    it("allows outreach to read contracts API", () => {
      expect(
        canAccessApiRoute(USER_ROLES.OUTREACH, "/api/contracts", "GET"),
      ).toBe(true);
    });

    it("allows public GET on events", () => {
      expect(canAccessApiRoute(null, "/api/events", "GET")).toBe(true);
    });

    it("allows public GET on partners, settings, and executives", () => {
      expect(canAccessApiRoute(null, "/api/partners", "GET")).toBe(true);
      expect(canAccessApiRoute(null, "/api/settings", "GET")).toBe(true);
      expect(canAccessApiRoute(null, "/api/executives", "GET")).toBe(true);
    });

    it("requires partners permission for partner mutations", () => {
      expect(
        canAccessApiRoute(USER_ROLES.MARKETING, "/api/partners", "POST"),
      ).toBe(true);
      expect(
        canAccessApiRoute(USER_ROLES.OUTREACH, "/api/partners", "POST"),
      ).toBe(true);
      expect(
        canAccessApiRoute(USER_ROLES.EVENTS, "/api/partners", "POST"),
      ).toBe(false);
    });

    it("requires events permission for event mutations", () => {
      expect(
        canAccessApiRoute(USER_ROLES.EVENTS, "/api/events", "POST"),
      ).toBe(true);
      expect(
        canAccessApiRoute(USER_ROLES.OUTREACH, "/api/events", "POST"),
      ).toBe(false);
    });

    it("allows public GET on community posts and requires permission to mutate", () => {
      expect(canAccessApiRoute(null, "/api/community-posts", "GET")).toBe(true);
      expect(
        canAccessApiRoute(USER_ROLES.OUTREACH, "/api/community-posts", "POST"),
      ).toBe(true);
      expect(
        canAccessApiRoute(USER_ROLES.ADMIN, "/api/community-posts", "POST"),
      ).toBe(true);
      expect(
        canAccessApiRoute(USER_ROLES.EVENTS, "/api/community-posts", "POST"),
      ).toBe(false);
      expect(
        canAccessApiRoute(USER_ROLES.MARKETING, "/api/community-posts", "DELETE"),
      ).toBe(false);
    });

    it("requires admin for marketing approval PUT", () => {
      expect(
        canAccessApiRoute(
          USER_ROLES.ADMIN,
          "/api/marketing-approvals/abc123",
          "PUT",
        ),
      ).toBe(true);
      expect(
        canAccessApiRoute(
          USER_ROLES.MARKETING,
          "/api/marketing-approvals/abc123",
          "PUT",
        ),
      ).toBe(false);
    });

    it("allows marketing to submit approvals", () => {
      expect(
        canAccessApiRoute(
          USER_ROLES.MARKETING,
          "/api/marketing-approvals",
          "POST",
        ),
      ).toBe(true);
    });

    it("allows finance to access finance documentation API", () => {
      expect(
        canAccessApiRoute(
          USER_ROLES.FINANCE,
          "/api/documentation/finance",
          "GET",
        ),
      ).toBe(true);
      expect(
        canAccessApiRoute(
          USER_ROLES.FINANCE,
          "/api/documentation/finance",
          "POST",
        ),
      ).toBe(true);
    });
  });

  describe("navigation helpers", () => {
    it("returns contracts, community, and partners nav items for outreach", () => {
      const items = getDashboardNavItems(USER_ROLES.OUTREACH);
      expect(items.some((i) => i.href === "/")).toBe(true);
      expect(items.some((i) => i.href === "/dashboard")).toBe(true);
      expect(items.some((i) => i.href === "/dashboard/contracts")).toBe(true);
      expect(items.some((i) => i.href === "/dashboard/community")).toBe(true);
      expect(items.some((i) => i.href === "/dashboard/partners")).toBe(true);
    });

    it("returns documentation nav item for finance", () => {
      const items = getDashboardNavItems(USER_ROLES.FINANCE);
      expect(items.some((i) => i.href === "/dashboard/documentation")).toBe(
        true,
      );
    });

    it("returns executive applications nav and card for projects", () => {
      const items = getDashboardNavItems(USER_ROLES.PROJECTS);
      expect(
        items.some((i) => i.href === "/dashboard/executive-applications"),
      ).toBe(true);
      expect(items.some((i) => i.href === "/dashboard/partners")).toBe(false);

      const cards = getAdminPanelCards(USER_ROLES.PROJECTS);
      expect(cards).toHaveLength(1);
      expect(cards[0].href).toBe("/dashboard/executive-applications");
    });

    it("returns admin panel cards based on role", () => {
      const outreachCards = getAdminPanelCards(USER_ROLES.OUTREACH);
      expect(outreachCards).toHaveLength(3);
      expect(outreachCards.map((c) => c.href)).toEqual([
        "/dashboard/contracts",
        "/dashboard/community",
        "/dashboard/partners",
      ]);

      const adminCards = getAdminPanelCards(USER_ROLES.ADMIN);
      expect(adminCards.length).toBeGreaterThan(4);
      expect(adminCards.some((c) => c.href === "/dashboard/community")).toBe(
        true,
      );
    });
  });

  describe("canAccessDashboardRoute community", () => {
    it("allows outreach and admin to access community dashboard", () => {
      expect(
        canAccessDashboardRoute(USER_ROLES.OUTREACH, "/dashboard/community"),
      ).toBe(true);
      expect(
        canAccessDashboardRoute(USER_ROLES.ADMIN, "/dashboard/community"),
      ).toBe(true);
    });

    it("denies events and marketing from community dashboard", () => {
      expect(
        canAccessDashboardRoute(USER_ROLES.EVENTS, "/dashboard/community"),
      ).toBe(false);
      expect(
        canAccessDashboardRoute(USER_ROLES.MARKETING, "/dashboard/community"),
      ).toBe(false);
    });
  });

  describe("role matrix completeness", () => {
    it("defines permissions for all five staff roles", () => {
      for (const role of STAFF_ROLES) {
        expect(getPermissionsForRole(role).length).toBeGreaterThan(0);
      }
    });

    it("admin has all permissions via isAdmin bypass", () => {
      expect(isAdmin(USER_ROLES.ADMIN)).toBe(true);
      expect(hasAnyPermission(USER_ROLES.ADMIN, Object.values(PERMISSIONS))).toBe(
        true,
      );
    });

    it("matches documented role permission map", () => {
      expect(ROLE_PERMISSIONS[USER_ROLES.OUTREACH]).toEqual([
        PERMISSIONS.CONTRACTS,
        PERMISSIONS.COMMUNITY,
        PERMISSIONS.PARTNERS,
      ]);
      expect(ROLE_PERMISSIONS[USER_ROLES.EVENTS]).toEqual([
        PERMISSIONS.EVENTS,
      ]);
    });
  });
});
