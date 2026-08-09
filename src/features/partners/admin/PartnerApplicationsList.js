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
      <div className="text-center py-12 sm:py-16 bg-gray-900/60 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 px-4">
        <FiUsers className="mx-auto text-3xl sm:text-4xl text-primary mb-3 sm:mb-4" />
        <p className="text-gray-400 text-base sm:text-lg">
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
