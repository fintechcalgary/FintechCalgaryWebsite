import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth/next";
import {
  requireAdmin,
  requireAnyPermission,
  requireAuth,
  requirePermission,
} from "@/lib/api-helpers";
import { PERMISSIONS } from "@/lib/permissions";
import { USER_ROLES } from "@/lib/constants";

describe("api-helpers auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requireAuth returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);
    const { session, error } = await requireAuth();
    expect(session).toBeNull();
    expect(error.status).toBe(401);
  });

  it("requireAuth returns session when authenticated", async () => {
    const mockSession = { user: { role: USER_ROLES.OUTREACH } };
    getServerSession.mockResolvedValue(mockSession);
    const { session, error } = await requireAuth();
    expect(session).toEqual(mockSession);
    expect(error).toBeNull();
  });

  it("requireAdmin rejects non-admin users", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.OUTREACH } });
    const { session, error } = await requireAdmin();
    expect(session).toBeNull();
    expect(error.status).toBe(403);
  });

  it("requireAdmin allows admin users", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.ADMIN } });
    const { session, error } = await requireAdmin();
    expect(session.user.role).toBe(USER_ROLES.ADMIN);
    expect(error).toBeNull();
  });

  it("requirePermission allows outreach for contracts", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.OUTREACH } });
    const { session, error } = await requirePermission(PERMISSIONS.CONTRACTS);
    expect(session.user.role).toBe(USER_ROLES.OUTREACH);
    expect(error).toBeNull();
  });

  it("requirePermission denies events role for contracts", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.EVENTS } });
    const { session, error } = await requirePermission(PERMISSIONS.CONTRACTS);
    expect(session).toBeNull();
    expect(error.status).toBe(403);
  });

  it("requireAnyPermission allows finance for documentation", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.FINANCE } });
    const { session, error } = await requireAnyPermission([
      PERMISSIONS.DOCUMENTATION,
      PERMISSIONS.DOCUMENTATION_FINANCE,
    ]);
    expect(session.user.role).toBe(USER_ROLES.FINANCE);
    expect(error).toBeNull();
  });

  it("requireAnyPermission denies outreach for finance docs", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.OUTREACH } });
    const { session, error } = await requireAnyPermission([
      PERMISSIONS.DOCUMENTATION_FINANCE,
    ]);
    expect(session).toBeNull();
    expect(error.status).toBe(403);
  });
});
