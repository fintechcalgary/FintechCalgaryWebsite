import {
  CONTRACT_STAGES,
  CONTRACT_STATUS,
  MARKETING_APPROVAL_STATUS,
  STAFF_ROLE_LABELS,
} from "@/lib/constants";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

const CALGARY = "America/Edmonton";

/** YYYY-MM-DD for a stored date, compared in Calgary. */
export function calendarDay(value, timeZone = CALGARY) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayInCalgary(now = new Date()) {
  return calendarDay(now);
}

function formatDay(isoDay) {
  if (!isoDay) return "";
  const [year, month, day] = isoDay.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const STAGE_SHORT = {
  "outreach-meetings": "Outreach",
  "eoi-submission": "EOI",
  "eoi-review": "Review",
  "legal-team-draft": "Draft",
  "legal-review": "Legal",
  "ops-director-approval": "Ops",
  "ceo-approval": "CEO",
  "execution-signature": "Sign",
};

function shorten(text, max = 18) {
  const value = (text || "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

function withChart(widget, chart) {
  if (!chart) return widget;
  return { ...widget, chart };
}

function statusSplit(items) {
  const present = items.filter((item) => item.value > 0);
  if (present.length < 2) return undefined;
  return { type: "split", items: present };
}

function upcoming(items, dateField, today) {
  return (items || [])
    .map((item) => ({ item, day: calendarDay(item[dateField]) }))
    .filter(({ day }) => day && day >= today)
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function eventsWidget(events, today) {
  const ahead = upcoming(events, "date", today);
  const next = ahead[0];
  const registered = next
    ? (next.item.registrationCount ??
      (Array.isArray(next.item.registrations) ? next.item.registrations.length : 0))
    : 0;

  const signupBars = ahead.slice(0, 4).map(({ item }) => ({
    label: shorten(item.title || "Untitled"),
    value:
      item.registrationCount ??
      (Array.isArray(item.registrations) ? item.registrations.length : 0),
  }));

  return withChart(
    {
      value: String(ahead.length),
      label: ahead.length === 1 ? "upcoming event" : "upcoming events",
      detail: next
        ? [next.item.title || "Untitled event", formatDay(next.day), registered ? `${registered} registered` : null]
            .filter(Boolean)
            .join(" · ")
        : "Nothing coming up",
    },
    ahead.length > 1 && signupBars.some((bar) => bar.value > 0)
      ? { type: "bars", items: signupBars }
      : undefined,
  );
}

export function communityWidget(posts, today) {
  const ahead = upcoming(posts, "eventDate", today);
  const next = ahead[0];
  const total = (posts || []).length;

  if (!next) {
    return {
      value: String(total),
      label: total === 1 ? "post on the board" : "posts on the board",
      detail: "No dated events ahead",
    };
  }

  return {
    value: String(ahead.length),
    label: ahead.length === 1 ? "upcoming post" : "upcoming posts",
    detail: [
      next.item.title || "Untitled post",
      formatDay(next.day),
      next.item.organizationName || null,
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

export function contractsWidget(contracts) {
  const active = (contracts || []).filter(
    (contract) =>
      contract.status !== CONTRACT_STATUS.COMPLETED &&
      contract.status !== CONTRACT_STATUS.DO_NOT_PROCEED,
  );
  const next = [...active].sort((a, b) => {
    const aTime = new Date(a.updatedAt || 0).getTime();
    const bTime = new Date(b.updatedAt || 0).getTime();
    return bTime - aTime;
  })[0];
  const stage = next ? CONTRACT_STAGES[next.stage] : null;
  const stageBars = CONTRACT_STAGES.map((pipelineStage, index) => ({
    label: STAGE_SHORT[pipelineStage.id] || pipelineStage.label,
    value: active.filter((contract) => (contract.stage ?? 0) === index).length,
  })).filter((bar) => bar.value > 0);

  return withChart(
    {
      value: String(active.length),
      label: active.length === 1 ? "contract in progress" : "contracts in progress",
      detail: next
        ? [next.partnerName || next.title || "Untitled", stage?.label]
            .filter(Boolean)
            .join(" · ")
        : "Pipeline is clear",
    },
    stageBars.length > 1 ? { type: "bars", items: stageBars.slice(0, 5) } : undefined,
  );
}

export function partnersWidget(applications, listedCount) {
  const tally = { pending: 0, accepted: 0, rejected: 0 };
  for (const application of applications || []) {
    const status = application.approvalStatus || "pending";
    if (status in tally) tally[status] += 1;
  }
  const listed = listedCount || 0;
  const chart = statusSplit([
    { label: "pending", value: tally.pending, tone: "amber" },
    { label: "accepted", value: tally.accepted, tone: "emerald" },
    { label: "rejected", value: tally.rejected, tone: "rose" },
  ]);

  if (tally.pending > 0) {
    return withChart(
      {
        value: String(tally.pending),
        label: tally.pending === 1 ? "application to review" : "applications to review",
        detail: `${listed} on the public partners list`,
      },
      chart,
    );
  }

  return withChart(
    {
      value: String(listed),
      label: listed === 1 ? "public partner" : "public partners",
      detail: "No applications waiting",
    },
    chart,
  );
}

export function executivesWidget(count) {
  return {
    value: String(count || 0),
    label: "on the public team",
    detail: count ? "Shown on the site" : "No executives listed yet",
  };
}

export function executiveApplicationsWidget(count, latest, roles) {
  const roleBars = (roles || [])
    .filter((role) => role.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((role) => ({ label: shorten(role.role || "Other", 16), value: role.count }));

  return withChart(
    {
      value: String(count || 0),
      label: count === 1 ? "application" : "applications",
      detail: latest?.name
        ? `Latest: ${latest.name}${latest.role ? ` · ${latest.role}` : ""}`
        : "No applications yet",
    },
    roleBars.length > 1 ? { type: "bars", items: roleBars } : undefined,
  );
}

/** Last six Calgary months, oldest first. `counts` is `{ month: "YYYY-MM", count }`. */
export function memberMonthSeries(counts, today) {
  const [year, month] = today.split("-").map(Number);
  const byMonth = new Map((counts || []).map((row) => [row.month, row.count]));
  const series = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(year, month - 1 - offset, 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    series.push({
      label: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      value: byMonth.get(key) || 0,
    });
  }

  return series;
}

export function membersWidget(count, joinedOrSeries) {
  const series = Array.isArray(joinedOrSeries) ? joinedOrSeries : null;
  const joinedThisMonth = series
    ? series[series.length - 1]?.value || 0
    : joinedOrSeries || 0;

  return withChart(
    {
      value: String(count || 0),
      label: count === 1 ? "member" : "members",
      detail: joinedThisMonth
        ? `${joinedThisMonth} joined this month`
        : "No new members this month",
    },
    series?.some((month) => month.value > 0)
      ? { type: "spark", items: series }
      : undefined,
  );
}

export function documentationWidget(fileCount, folderCount, folders) {
  const folderTotal = folderCount || 0;
  const fileBars = (folders || [])
    .filter((folder) => folder.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((folder) => ({ label: shorten(folder.name, 16), value: folder.count }));

  return withChart(
    {
      value: String(fileCount || 0),
      label: fileCount === 1 ? "file" : "files",
      detail: `${folderTotal} ${folderTotal === 1 ? "folder" : "folders"}`,
    },
    fileBars.length > 1 ? { type: "bars", items: fileBars } : undefined,
  );
}

function marketingStatusChart(items) {
  const tally = { pending: 0, approved: 0, rejected: 0 };
  for (const item of items || []) {
    if (item.status in tally) tally[item.status] += 1;
  }
  return statusSplit([
    { label: "pending", value: tally.pending, tone: "amber" },
    { label: "approved", value: tally.approved, tone: "emerald" },
    { label: "rejected", value: tally.rejected, tone: "rose" },
  ]);
}

export function marketingSubmissionsWidget(items) {
  const pending = (items || []).filter(
    (item) => item.status === MARKETING_APPROVAL_STATUS.PENDING,
  ).length;
  const total = (items || []).length;
  return withChart(
    {
      value: String(pending),
      label: "awaiting review",
      detail: total
        ? `${total} ${total === 1 ? "submission" : "submissions"}`
        : "Nothing submitted yet",
    },
    marketingStatusChart(items),
  );
}

export function marketingApprovalsWidget(items) {
  const pending = (items || []).filter(
    (item) => item.status === MARKETING_APPROVAL_STATUS.PENDING,
  );
  const next = pending[0];
  return withChart(
    {
      value: String(pending.length),
      label: "to approve",
      detail: next?.title || "Inbox is clear",
    },
    marketingStatusChart(items),
  );
}

export function usersWidget(count, roles) {
  const roleBars = (roles || [])
    .filter((role) => role.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((role) => ({
      label: STAFF_ROLE_LABELS[role.role] || role.role,
      value: role.count,
    }));
  const total = roles
    ? roleBars.reduce((sum, role) => sum + role.value, 0)
    : count || 0;

  return withChart(
    {
      value: String(total),
      label: total === 1 ? "staff account" : "staff accounts",
      detail: "Role-based access",
    },
    roleBars.length > 1 ? { type: "bars", items: roleBars } : undefined,
  );
}

/**
 * Build widget payloads for the tools this role can open.
 * `data` only needs the collections that role is allowed to see.
 */
export function buildDashboardSummary(role, data, today = todayInCalgary()) {
  const widgets = {};

  if (hasPermission(role, PERMISSIONS.EVENTS)) {
    widgets["/dashboard/events"] = eventsWidget(data.events, today);
  }
  if (hasPermission(role, PERMISSIONS.COMMUNITY)) {
    widgets["/dashboard/community"] = communityWidget(data.communityPosts, today);
  }
  if (hasPermission(role, PERMISSIONS.CONTRACTS)) {
    widgets["/dashboard/contracts"] = contractsWidget(data.contracts);
  }
  if (hasPermission(role, PERMISSIONS.PARTNERS)) {
    widgets["/dashboard/partners"] = partnersWidget(
      data.partnerApplications,
      data.partnerCount,
    );
  }
  if (hasPermission(role, PERMISSIONS.EXECUTIVES)) {
    widgets["/dashboard/executives"] = executivesWidget(data.executiveCount);
  }
  if (hasPermission(role, PERMISSIONS.EXECUTIVE_APPLICATIONS)) {
    widgets["/dashboard/executive-applications"] = executiveApplicationsWidget(
      data.executiveApplicationCount,
      data.latestExecutiveApplication,
      data.executiveApplicationRoles,
    );
  }
  if (hasPermission(role, PERMISSIONS.MEMBERS)) {
    const series = Array.isArray(data.memberMonths)
      ? memberMonthSeries(data.memberMonths, today)
      : data.membersJoinedThisMonth || 0;
    widgets["/dashboard/members"] = membersWidget(data.memberCount, series);
  }
  if (hasPermission(role, PERMISSIONS.DOCUMENTATION)) {
    widgets["/dashboard/documentation"] = documentationWidget(
      data.documentCount,
      data.folderCount,
      data.documentationFolders,
    );
  }
  if (hasPermission(role, PERMISSIONS.MARKETING_SUBMIT)) {
    widgets["/dashboard/marketing-submissions"] = marketingSubmissionsWidget(
      data.marketingSubmissions,
    );
  }
  if (hasPermission(role, PERMISSIONS.MARKETING_APPROVE)) {
    widgets["/dashboard/marketing-approvals"] = marketingApprovalsWidget(
      data.marketingApprovals,
    );
  }
  if (hasPermission(role, PERMISSIONS.USERS)) {
    widgets["/dashboard/users"] = usersWidget(data.userCount, data.userRoles);
  }

  return widgets;
}
