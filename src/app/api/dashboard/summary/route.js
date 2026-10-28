import { connectToDatabase } from "@/lib/mongodb";
import { apiResponse, requireAuth, withErrorHandler } from "@/lib/api-helpers";
import { COLLECTIONS, USER_ROLES } from "@/lib/constants";
import { buildDashboardSummary, todayInCalgary } from "@/lib/dashboardWidgets";
import { PERMISSIONS, STAFF_ROLES, hasPermission, isStaffRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function memberJoinsByMonth(db) {
  const rows = await db
    .collection(COLLECTIONS.MEMBERS)
    .aggregate([
      { $match: { createdAt: { $type: "date" } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
              timezone: "America/Edmonton",
            },
          },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  return rows.map((row) => ({ month: row._id, count: row.count }));
}

export const GET = withErrorHandler(async () => {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!isStaffRole(session.user.role)) return apiResponse.forbidden();

  const role = session.user.role;
  const db = await connectToDatabase();
  const today = todayInCalgary();
  const data = {};

  if (hasPermission(role, PERMISSIONS.EVENTS)) {
    data.events = await db
      .collection(COLLECTIONS.EVENTS)
      .aggregate([
        {
          $project: {
            title: 1,
            date: 1,
            registrationCount: {
              $size: { $ifNull: ["$registrations", []] },
            },
          },
        },
      ])
      .toArray();
  }

  if (hasPermission(role, PERMISSIONS.COMMUNITY)) {
    data.communityPosts = await db
      .collection(COLLECTIONS.COMMUNITY_POSTS)
      .find({}, { projection: { title: 1, eventDate: 1, organizationName: 1 } })
      .toArray();
  }

  if (hasPermission(role, PERMISSIONS.CONTRACTS)) {
    data.contracts = await db
      .collection(COLLECTIONS.CONTRACTS)
      .find(
        {},
        { projection: { title: 1, partnerName: 1, status: 1, stage: 1, updatedAt: 1 } },
      )
      .toArray();
  }

  if (hasPermission(role, PERMISSIONS.PARTNERS)) {
    const [applications, partnerCount] = await Promise.all([
      db
        .collection(COLLECTIONS.PARTNER_APPLICATIONS)
        .find({}, { projection: { approvalStatus: 1 } })
        .toArray(),
      db.collection(COLLECTIONS.PARTNERS).countDocuments({}),
    ]);
    data.partnerApplications = applications;
    data.partnerCount = partnerCount;
  }

  if (hasPermission(role, PERMISSIONS.EXECUTIVES)) {
    data.executiveCount = await db.collection(COLLECTIONS.EXECUTIVES).countDocuments({});
  }

  if (hasPermission(role, PERMISSIONS.EXECUTIVE_APPLICATIONS)) {
    const [executiveApplicationCount, latest, roleRows] = await Promise.all([
      db.collection(COLLECTIONS.EXECUTIVE_APPLICATIONS).countDocuments({}),
      db
        .collection(COLLECTIONS.EXECUTIVE_APPLICATIONS)
        .find({}, { projection: { name: 1, role: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray(),
      db
        .collection(COLLECTIONS.EXECUTIVE_APPLICATIONS)
        .aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
        .toArray(),
    ]);
    data.executiveApplicationCount = executiveApplicationCount;
    data.latestExecutiveApplication = latest[0] || null;
    data.executiveApplicationRoles = roleRows.map((row) => ({
      role: row._id,
      count: row.count,
    }));
  }

  if (hasPermission(role, PERMISSIONS.MEMBERS)) {
    const [memberCount, memberMonths] = await Promise.all([
      db.collection(COLLECTIONS.MEMBERS).countDocuments({}),
      memberJoinsByMonth(db),
    ]);
    data.memberCount = memberCount;
    data.memberMonths = memberMonths;
  }

  if (hasPermission(role, PERMISSIONS.DOCUMENTATION)) {
    const [folders, counts] = await Promise.all([
      db
        .collection(COLLECTIONS.DOCUMENTATION_FOLDERS)
        .find({}, { projection: { name: 1 } })
        .toArray(),
      db
        .collection(COLLECTIONS.DOCUMENTATION_DOCUMENTS)
        .aggregate([{ $group: { _id: "$folderId", count: { $sum: 1 } } }])
        .toArray(),
    ]);
    const countByFolder = new Map(
      counts.map((row) => [String(row._id), row.count]),
    );
    data.documentationFolders = folders.map((folder) => ({
      name: folder.name,
      count: countByFolder.get(String(folder._id)) || 0,
    }));
    data.folderCount = folders.length;
    data.documentCount = data.documentationFolders.reduce(
      (sum, folder) => sum + folder.count,
      0,
    );
  }

  if (
    hasPermission(role, PERMISSIONS.MARKETING_SUBMIT) ||
    hasPermission(role, PERMISSIONS.MARKETING_APPROVE)
  ) {
    const submittedBy =
      role === USER_ROLES.MARKETING
        ? session.user.username || session.user.email
        : null;
    const query = submittedBy ? { submittedBy } : {};
    const items = await db
      .collection(COLLECTIONS.MARKETING_APPROVALS)
      .find(query, { projection: { status: 1, title: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    if (hasPermission(role, PERMISSIONS.MARKETING_SUBMIT)) {
      data.marketingSubmissions = items;
    }
    if (hasPermission(role, PERMISSIONS.MARKETING_APPROVE)) {
      data.marketingApprovals = items;
    }
  }

  if (hasPermission(role, PERMISSIONS.USERS)) {
    const roleRows = await db
      .collection(COLLECTIONS.USERS)
      .aggregate([
        { $match: { role: { $in: STAFF_ROLES } } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ])
      .toArray();
    data.userRoles = roleRows.map((row) => ({
      role: row._id,
      count: row.count,
    }));
  }

  return apiResponse.success(buildDashboardSummary(role, data, today));
});
