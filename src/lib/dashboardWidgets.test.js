import { describe, expect, it } from "vitest";
import { USER_ROLES, CONTRACT_STATUS } from "@/lib/constants";
import { buildDashboardSummary } from "@/lib/dashboardWidgets";

const TODAY = "2026-10-27";

describe("buildDashboardSummary", () => {
  it("only includes widgets for the caller's role", () => {
    const widgets = buildDashboardSummary(
      USER_ROLES.EVENTS,
      {
        events: [{ title: "Mixer", date: "2026-11-02", registrationCount: 4 }],
        contracts: [{ title: "Hidden", status: CONTRACT_STATUS.ACTIVE, stage: 0 }],
      },
      TODAY,
    );

    expect(Object.keys(widgets)).toEqual(["/dashboard/events"]);
    expect(widgets["/dashboard/events"]).toEqual({
      value: "1",
      label: "upcoming event",
      detail: "Mixer · Nov 2 · 4 registered",
    });
  });

  it("counts pending partner applications ahead of the public list", () => {
    const widgets = buildDashboardSummary(
      USER_ROLES.OUTREACH,
      {
        contracts: [
          {
            title: "Old",
            partnerName: "Northwind",
            status: CONTRACT_STATUS.ACTIVE,
            stage: 2,
            updatedAt: "2026-10-01",
          },
          {
            title: "Done",
            status: CONTRACT_STATUS.COMPLETED,
            stage: 7,
            updatedAt: "2026-10-20",
          },
        ],
        communityPosts: [
          { title: "Past night", eventDate: "2026-09-01", organizationName: "Acme" },
        ],
        partnerApplications: [{ approvalStatus: "pending" }, { approvalStatus: "accepted" }],
        partnerCount: 6,
      },
      TODAY,
    );

    expect(widgets["/dashboard/contracts"].value).toBe("1");
    expect(widgets["/dashboard/contracts"].detail).toBe("Northwind · EOI Review");
    expect(widgets["/dashboard/partners"]).toMatchObject({
      value: "1",
      label: "application to review",
      detail: "6 on the public partners list",
      chart: {
        type: "split",
        items: [
          { label: "pending", value: 1, tone: "amber" },
          { label: "accepted", value: 1, tone: "emerald" },
        ],
      },
    });
    expect(widgets["/dashboard/community"].value).toBe("1");
    expect(widgets["/dashboard/community"].label).toBe("post on the board");
    expect(widgets["/dashboard/events"]).toBeUndefined();
  });

  it("shows an empty pipeline and a clear marketing inbox", () => {
    const widgets = buildDashboardSummary(
      USER_ROLES.ADMIN,
      {
        events: [],
        communityPosts: [],
        contracts: [],
        partnerApplications: [],
        partnerCount: 0,
        executiveCount: 8,
        executiveApplicationCount: 2,
        latestExecutiveApplication: { name: "Avery Chen", role: "Events" },
        memberCount: 40,
        membersJoinedThisMonth: 3,
        documentCount: 12,
        folderCount: 2,
        marketingSubmissions: [{ status: "approved", title: "Banner" }],
        marketingApprovals: [{ status: "approved", title: "Banner" }],
        userCount: 6,
      },
      TODAY,
    );

    expect(widgets["/dashboard/events"].detail).toBe("Nothing coming up");
    expect(widgets["/dashboard/contracts"].detail).toBe("Pipeline is clear");
    expect(widgets["/dashboard/executives"].value).toBe("8");
    expect(widgets["/dashboard/executive-applications"].detail).toBe(
      "Latest: Avery Chen · Events",
    );
    expect(widgets["/dashboard/members"].detail).toBe("3 joined this month");
    expect(widgets["/dashboard/documentation"]).toEqual({
      value: "12",
      label: "files",
      detail: "2 folders",
    });
    expect(widgets["/dashboard/marketing-approvals"].detail).toBe("Inbox is clear");
    expect(widgets["/dashboard/users"].value).toBe("6");
    expect(widgets["/dashboard/contracts"].chart).toBeUndefined();
    expect(widgets["/dashboard/executives"].chart).toBeUndefined();
  });

  it("adds a chart only when the widget has something to compare", () => {
    const widgets = buildDashboardSummary(
      USER_ROLES.ADMIN,
      {
        events: [
          { title: "Mixer", date: "2026-11-02", registrationCount: 12 },
          { title: "Workshop", date: "2026-11-18", registrationCount: 3 },
        ],
        contracts: [
          { partnerName: "Northwind", status: CONTRACT_STATUS.ACTIVE, stage: 0 },
          { partnerName: "Fabrikam", status: CONTRACT_STATUS.ACTIVE, stage: 4 },
        ],
        memberCount: 10,
        memberMonths: [
          { month: "2026-08", count: 2 },
          { month: "2026-10", count: 4 },
        ],
        documentCount: 9,
        folderCount: 2,
        documentationFolders: [
          { name: "Finance", count: 6 },
          { name: "Agreements", count: 3 },
        ],
        userRoles: [
          { role: USER_ROLES.ADMIN, count: 1 },
          { role: USER_ROLES.EVENTS, count: 2 },
        ],
        executiveApplicationCount: 3,
        executiveApplicationRoles: [
          { role: "Events", count: 2 },
          { role: "Marketing", count: 1 },
        ],
        marketingApprovals: [
          { status: "pending", title: "Banner" },
          { status: "approved", title: "Reel" },
        ],
      },
      TODAY,
    );

    expect(widgets["/dashboard/events"].chart.items.map((item) => item.value)).toEqual([
      12, 3,
    ]);
    expect(widgets["/dashboard/contracts"].chart.items).toEqual([
      { label: "Outreach", value: 1 },
      { label: "Legal", value: 1 },
    ]);
    expect(widgets["/dashboard/members"].chart.type).toBe("spark");
    expect(widgets["/dashboard/members"].chart.items).toHaveLength(6);
    expect(widgets["/dashboard/members"].detail).toBe("4 joined this month");
    expect(widgets["/dashboard/documentation"].chart.items).toEqual([
      { label: "Finance", value: 6 },
      { label: "Agreements", value: 3 },
    ]);
    expect(widgets["/dashboard/users"].chart.items).toEqual([
      { label: "Events", value: 2 },
      { label: "Admin", value: 1 },
    ]);
    expect(widgets["/dashboard/executive-applications"].chart.type).toBe("bars");
    expect(widgets["/dashboard/marketing-approvals"].chart.type).toBe("split");
    expect(widgets["/dashboard/community"].chart).toBeUndefined();
    expect(widgets["/dashboard/executives"].chart).toBeUndefined();
  });
});
