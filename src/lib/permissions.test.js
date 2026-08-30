import { describe, it, expect } from "vitest";
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  STAFF_ROLES,
  canAccessApiRoute,
  canAccessDashboardRoute,
  getAdminPanelCards,
  getDashboardNavItems,
  getPermissionsForRole,
  hasAnyPermission,
  hasPermission,
  isAdmin,
  isStaffRole,
} from "@/lib/permissions";
import { USER_ROLES } from "@/lib/constants";

describe("permissions", () => {
  describe("isStaffRole", () => {
    it("returns true for all five staff roles", () => {
      expect(isStaffRole(USER_ROLES.ADMIN)).toBe(true);
      expect(isStaffRole(USER_ROLES.OUTREACH)).toBe(true);
      expect(isStaffRole(USER_ROLES.FINANCE)).toBe(true);
      expect(isStaffRole(USER_ROLES.EVENTS)).toBe(true);
      expect(isStaffRole(USER_ROLES.MARKETING)).toBe(true);
    });

    it("returns false for associate and member", () => {
      expect(isStaffRole(USER_ROLES.ASSOCIATE)).toBe(false);
      expect(isStaffRole(USER_ROLES.MEMBER)).toBe(false);
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

    it("grants outreach contracts access only", () => {
      expect(hasPermission(USER_ROLES.OUTREACH, PERMISSIONS.CONTRACTS)).toBe(true);
      expect(hasPermission(USER_ROLES.OUTREACH, PERMISSIONS.EVENTS)).toBe(false);
      expect(hasPermission(USER_ROLES.OUTREACH, PERMISSIONS.PARTNERS)).toBe(false);
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
  });

  describe("canAccessDashboardRoute", () => {
    it("allows outreach to access contracts", () => {
      expect(
        canAccessDashboardRoute(USER_ROLES.OUTREACH, "/dashboard/contracts"),
      ).toBe(true);
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

    it("requires events permission for event mutations", () => {
      expect(
        canAccessApiRoute(USER_ROLES.EVENTS, "/api/events", "POST"),
      ).toBe(true);
      expect(
        canAccessApiRoute(USER_ROLES.OUTREACH, "/api/events", "POST"),
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
    it("returns contracts nav item for outreach", () => {
      const items = getDashboardNavItems(USER_ROLES.OUTREACH);
      expect(items.some((i) => i.href === "/")).toBe(true);
      expect(items.some((i) => i.href === "/dashboard")).toBe(true);
      expect(items.some((i) => i.href === "/dashboard/contracts")).toBe(true);
      expect(items.some((i) => i.href === "/dashboard/partners")).toBe(false);
    });

    it("returns documentation nav item for finance", () => {
      const items = getDashboardNavItems(USER_ROLES.FINANCE);
      expect(items.some((i) => i.href === "/dashboard/documentation")).toBe(
        true,
      );
    });

    it("returns admin panel cards based on role", () => {
      const outreachCards = getAdminPanelCards(USER_ROLES.OUTREACH);
      expect(outreachCards).toHaveLength(1);
      expect(outreachCards[0].href).toBe("/dashboard/contracts");

      const adminCards = getAdminPanelCards(USER_ROLES.ADMIN);
      expect(adminCards.length).toBeGreaterThan(4);
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
      ]);
      expect(ROLE_PERMISSIONS[USER_ROLES.EVENTS]).toEqual([
        PERMISSIONS.EVENTS,
      ]);
    });
  });
});
