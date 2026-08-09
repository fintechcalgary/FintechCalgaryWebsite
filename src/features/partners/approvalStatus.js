/**
 * Shared approval-status labels and badge classes for partner applications.
 */
export function getApprovalStatusMeta(status) {
  switch (status) {
    case "accepted":
      return {
        label: "Approved",
        shortLabel: "Accepted",
        colorClass: "bg-green-500/20 text-green-400 border-green-500/30",
        badgeClass: "bg-green-500/20 text-green-500",
        icon: "accepted",
      };
    case "rejected":
      return {
        label: "Rejected",
        shortLabel: "Rejected",
        colorClass: "bg-red-500/20 text-red-400 border-red-500/30",
        badgeClass: "bg-red-500/20 text-red-500",
        icon: "rejected",
      };
    case "pending":
    default:
      return {
        label: "Awaiting Approval",
        shortLabel: "Pending",
        colorClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        badgeClass: "bg-yellow-500/20 text-yellow-500",
        icon: "pending",
      };
  }
}
