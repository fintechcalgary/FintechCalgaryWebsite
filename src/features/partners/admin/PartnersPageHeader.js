"use client";

import AdminBackLink from "@/components/ui/AdminBackLink";
import {
  AdminPageTitle,
  AdminPageLede,
} from "@/components/ui/SectionHeading";

export default function PartnersPageHeader() {
  return (
    <div className="mb-6 sm:mb-8">
      <AdminBackLink />
      <div className="min-w-0 space-y-1 sm:space-y-2">
        <AdminPageTitle className="truncate">Partners</AdminPageTitle>
        <AdminPageLede>
          Manage the public partners list and organization applications in one
          place
        </AdminPageLede>
      </div>
    </div>
  );
}
