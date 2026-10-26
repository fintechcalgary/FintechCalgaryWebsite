/**
 * Shared status → badge tone/label maps for admin and partner surfaces.
 * Prefer StatusBadge + tone; className helpers remain for gradual migration.
 */

export const TONE_CLASSES = {
  success: "bg-green-500/20 text-green-400 border-green-500/30",
  danger: "bg-red-500/20 text-red-400 border-red-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  info: "bg-primary/20 text-primary border-primary/30",
  primary: "bg-purple-600/60 text-purple-100 border-purple-500",
  muted: "bg-gray-800/60 text-gray-300 border-gray-700",
  neutral: "bg-white/[0.06] text-white/70 border-white/10",
};

export const SIZE_CLASSES = {
  sm: "gap-1 px-2.5 py-1 text-xs",
  md: "gap-1.5 px-3 py-1.5 text-xs sm:text-sm",
  lg: "gap-2 px-4 py-2 text-sm",
};

export const APPROVAL_STATUS_META = {
  accepted: {
    tone: "success",
    label: "Approved",
    shortLabel: "Accepted",
  },
  rejected: {
    tone: "danger",
    label: "Rejected",
    shortLabel: "Rejected",
  },
  pending: {
    tone: "warning",
    label: "Awaiting Approval",
    shortLabel: "Pending",
  },
};

export function getApprovalStatusMeta(status) {
  const key =
    status === "accepted" || status === "rejected" ? status : "pending";
  const meta = APPROVAL_STATUS_META[key];
  const className = TONE_CLASSES[meta.tone];
  return {
    ...meta,
    /** @deprecated use StatusBadge tone */
    colorClass: className,
    /** @deprecated use StatusBadge tone */
    badgeClass: className,
  };
}

export const MARKETING_STATUS_META = {
  pending: { tone: "warning", label: "Pending Review" },
  approved: { tone: "success", label: "Approved" },
  rejected: { tone: "danger", label: "Rejected" },
};

export function getMarketingStatusMeta(status) {
  const meta = MARKETING_STATUS_META[status] || MARKETING_STATUS_META.pending;
  return {
    ...meta,
    className: TONE_CLASSES[meta.tone],
  };
}

/** Keys match CONTRACT_STATUS in lib/constants.js */
export const CONTRACT_STATUS_META = {
  active: { tone: "info", label: "In Progress" },
  completed: { tone: "success", label: "Completed" },
  "do-not-proceed": { tone: "danger", label: "Do Not Proceed" },
};

export function getContractStatusMeta(status) {
  const meta = CONTRACT_STATUS_META[status] || {
    tone: "neutral",
    label: status || "Unknown",
  };
  return {
    ...meta,
    className: TONE_CLASSES[meta.tone] || TONE_CLASSES.neutral,
  };
}
