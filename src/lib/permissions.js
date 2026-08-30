import { USER_ROLES } from "@/lib/constants";

/**
 * Permission identifiers for role-based access control.
 */
export const PERMISSIONS = {
  CONTRACTS: "contracts",
  EVENTS: "events",
  PARTNERS: "partners",
  DOCUMENTATION: "documentation",
  DOCUMENTATION_FINANCE: "documentation:finance",
  MARKETING_SUBMIT: "marketing:submit",
  MARKETING_APPROVE: "marketing:approve",
  MEMBERS: "members",
  EXECUTIVES: "executives",
  EXECUTIVE_APPLICATIONS: "executive-applications",
  SETTINGS: "settings",
  USERS: "users",
};

/** Roles that can access the internal staff dashboard */
export const STAFF_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.OUTREACH,
  USER_ROLES.FINANCE,
  USER_ROLES.EVENTS,
  USER_ROLES.MARKETING,
];

/** Maps each staff role to its granted permissions */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.OUTREACH]: [PERMISSIONS.CONTRACTS],
  [USER_ROLES.FINANCE]: [
    PERMISSIONS.DOCUMENTATION,
    PERMISSIONS.DOCUMENTATION_FINANCE,
  ],
  [USER_ROLES.EVENTS]: [PERMISSIONS.EVENTS],
  [USER_ROLES.MARKETING]: [
    PERMISSIONS.PARTNERS,
    PERMISSIONS.MARKETING_SUBMIT,
  ],
};

/** Dashboard routes and required permissions */
export const DASHBOARD_ROUTE_PERMISSIONS = {
  "/dashboard/contracts": PERMISSIONS.CONTRACTS,
  "/dashboard/partners": PERMISSIONS.PARTNERS,
  "/dashboard/members": PERMISSIONS.MEMBERS,
  "/dashboard/executive-applications": PERMISSIONS.EXECUTIVE_APPLICATIONS,
  "/dashboard/documentation": PERMISSIONS.DOCUMENTATION,
  "/dashboard/marketing-submissions": PERMISSIONS.MARKETING_SUBMIT,
  "/dashboard/marketing-approvals": PERMISSIONS.MARKETING_APPROVE,
  "/dashboard/users": PERMISSIONS.USERS,
};

/** API route prefixes and required permissions (admin bypasses all) */
export const API_ROUTE_PERMISSIONS = [
  { prefix: "/api/contracts", permission: PERMISSIONS.CONTRACTS },
  { prefix: "/api/events", permission: PERMISSIONS.EVENTS, publicGet: true },
  {
    prefix: "/api/partners",
    permission: PERMISSIONS.PARTNERS,
    publicGet: true,
  },
  {
    prefix: "/api/partner-applications",
    permission: PERMISSIONS.PARTNERS,
  },
  { prefix: "/api/members", permission: PERMISSIONS.MEMBERS },
  { prefix: "/api/executives", permission: PERMISSIONS.EXECUTIVES },
  {
    prefix: "/api/executive-roles",
    permission: PERMISSIONS.EXECUTIVE_APPLICATIONS,
    publicGet: true,
  },
  {
    prefix: "/api/executive-application",
    permission: PERMISSIONS.EXECUTIVE_APPLICATIONS,
  },
  { prefix: "/api/settings", permission: PERMISSIONS.SETTINGS, publicGet: true },
  { prefix: "/api/documentation", permission: PERMISSIONS.DOCUMENTATION },
  {
    prefix: "/api/documentation/finance",
    permission: PERMISSIONS.DOCUMENTATION_FINANCE,
  },
  {
    prefix: "/api/marketing-approvals",
    permission: PERMISSIONS.MARKETING_SUBMIT,
    approvePermission: PERMISSIONS.MARKETING_APPROVE,
  },
  { prefix: "/api/users", permission: PERMISSIONS.USERS },
];

export function isStaffRole(role) {
  return STAFF_ROLES.includes(role);
}

export function isAdmin(role) {
  return role === USER_ROLES.ADMIN;
}

export function getPermissionsForRole(role) {
  if (!role) return [];
  if (isAdmin(role)) return Object.values(PERMISSIONS);
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  if (isAdmin(role)) return true;
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(role, permissions) {
  return permissions.some((p) => hasPermission(role, p));
}

export function canAccessDashboardRoute(role, pathname) {
  if (!isStaffRole(role)) return false;
  if (isAdmin(role)) return true;

  const normalized = pathname.split("?")[0].split("#")[0];
  const permission = DASHBOARD_ROUTE_PERMISSIONS[normalized];
  if (!permission) return true;

  return hasPermission(role, permission);
}

export function getApiRoutePermission(pathname, method) {
  for (const route of API_ROUTE_PERMISSIONS) {
    if (!pathname.startsWith(route.prefix)) continue;

    if (route.publicGet && method === "GET") {
      return null;
    }

    if (
      route.approvePermission &&
      method === "PUT" &&
      pathname.startsWith(`${route.prefix}/`) &&
      pathname !== route.prefix
    ) {
      return route.approvePermission;
    }

    return route.permission;
  }
  return null;
}

export function canAccessApiRoute(role, pathname, method = "GET") {
  const permission = getApiRoutePermission(pathname, method);
  if (!permission) return true;
  return hasPermission(role, permission);
}

export function getDashboardNavItems(role) {
  if (!isStaffRole(role)) return [];

  const items = [];

  if (hasPermission(role, PERMISSIONS.EVENTS)) {
    items.push({ label: "Events", href: "/dashboard#events" });
  }
  if (hasPermission(role, PERMISSIONS.EXECUTIVES)) {
    items.push({ label: "Executives", href: "/dashboard#executives" });
  }
  if (hasPermission(role, PERMISSIONS.CONTRACTS)) {
    items.push({ label: "Contracts", href: "/dashboard/contracts" });
  }
  if (hasPermission(role, PERMISSIONS.PARTNERS)) {
    items.push({ label: "Partners", href: "/dashboard/partners" });
  }
  if (hasPermission(role, PERMISSIONS.DOCUMENTATION)) {
    items.push({ label: "Documentation", href: "/dashboard/documentation" });
  }
  if (hasPermission(role, PERMISSIONS.MARKETING_SUBMIT)) {
    items.push({
      label: "Marketing Submissions",
      href: "/dashboard/marketing-submissions",
    });
  }
  if (hasPermission(role, PERMISSIONS.MARKETING_APPROVE)) {
    items.push({
      label: "Marketing Approvals",
      href: "/dashboard/marketing-approvals",
    });
  }
  if (hasPermission(role, PERMISSIONS.MEMBERS)) {
    items.push({ label: "Members", href: "/dashboard/members" });
  }
  if (hasPermission(role, PERMISSIONS.USERS)) {
    items.push({ label: "Users", href: "/dashboard/users" });
  }

  items.push({ label: "Info", href: "/info" });

  return items;
}

export function getAdminPanelCards(role) {
  if (!isStaffRole(role)) return [];

  const cards = [];

  if (hasPermission(role, PERMISSIONS.CONTRACTS)) {
    cards.push({
      title: "Contracts",
      description:
        "Track contracts through the approvals pipeline, from outreach to execution",
      href: "/dashboard/contracts",
      color: "blue",
    });
  }
  if (hasPermission(role, PERMISSIONS.PARTNERS)) {
    cards.push({
      title: "Partners",
      description:
        "Manage the public partners list and review organization applications",
      href: "/dashboard/partners",
      color: "purple",
    });
  }
  if (hasPermission(role, PERMISSIONS.EXECUTIVE_APPLICATIONS)) {
    cards.push({
      title: "Executive Applications",
      description:
        "Review executive team applications, manage roles, and control application settings",
      href: "/dashboard/executive-applications",
      color: "pink",
    });
  }
  if (hasPermission(role, PERMISSIONS.MEMBERS)) {
    cards.push({
      title: "Members",
      description: "Manage general members, mailing lists, and export member data",
      href: "/dashboard/members",
      color: "purple",
    });
  }
  if (hasPermission(role, PERMISSIONS.DOCUMENTATION)) {
    cards.push({
      title: "Documentation",
      description: "Club documentation and finance records",
      href: "/dashboard/documentation",
      color: "blue",
    });
  }
  if (hasPermission(role, PERMISSIONS.MARKETING_SUBMIT)) {
    cards.push({
      title: "Marketing Submissions",
      description:
        "Upload marketing content and partner approval proof for admin review",
      href: "/dashboard/marketing-submissions",
      color: "pink",
    });
  }
  if (hasPermission(role, PERMISSIONS.MARKETING_APPROVE)) {
    cards.push({
      title: "Marketing Approvals",
      description: "Review and approve marketing submissions from the team",
      href: "/dashboard/marketing-approvals",
      color: "purple",
    });
  }
  if (hasPermission(role, PERMISSIONS.USERS)) {
    cards.push({
      title: "Users",
      description: "Manage staff accounts and role-based access",
      href: "/dashboard/users",
      color: "blue",
    });
  }

  return cards;
}
