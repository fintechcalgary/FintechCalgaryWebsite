"use client";

import { FiCalendar, FiHome, FiUsers } from "react-icons/fi";
import PartnersStatCard from "@/features/partners/admin/PartnersStatCard";

export default function PartnerApplicationsStats({ partners = [] }) {
  const pending = partners.filter((m) => m.approvalStatus === "pending").length;
  const approved = partners.filter(
    (m) => m.approvalStatus === "accepted"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <PartnersStatCard
        label="Total Organizations"
        value={partners.length}
        icon={FiHome}
      />
      <PartnersStatCard
        label="Pending Approval"
        value={pending}
        icon={FiCalendar}
        accent="yellow"
      />
      <PartnersStatCard
        label="Approved"
        value={approved}
        icon={FiUsers}
        accent="green"
      />
    </div>
  );
}
