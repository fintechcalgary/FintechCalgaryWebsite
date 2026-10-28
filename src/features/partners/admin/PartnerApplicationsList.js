"use client";

import { FiUsers } from "react-icons/fi";
import PartnerApplicationCard from "@/features/partners/admin/PartnerApplicationCard";

export default function PartnerApplicationsList({
  partners,
  onEdit,
  onDelete,
  onDownloadLogo,
  onApprovalStatusChange,
}) {
  if (partners.length === 0) {
    return (
      <div className="fc-admin-panel text-center py-12 sm:py-16 px-4">
        <span className="fc-icon mx-auto mb-3 sm:mb-4">
          <FiUsers className="h-10 w-10" />
        </span>
        <p className="fc-body">
          No partner applications found
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {partners.map((member, index) => (
        <PartnerApplicationCard
          key={member._id}
          member={member}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
          onDownloadLogo={onDownloadLogo}
          onApprovalStatusChange={onApprovalStatusChange}
        />
      ))}
    </div>
  );
}
