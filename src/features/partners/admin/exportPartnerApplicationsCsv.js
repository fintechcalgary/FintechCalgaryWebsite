import { downloadCsv } from "@/lib/csv";
import { formatDateLocale, todayIsoDate } from "@/lib/dates";

const CSV_HEADERS = [
  "Organization Name",
  "Username",
  "Contact Title",
  "Contact First Name",
  "Contact Last Name",
  "Contact Email",
  "Contact Phone",
  "Organization Email",
  "Organization Phone",
  "Website",
  "LinkedIn",
  "Facebook",
  "Twitter",
  "Address",
  "City",
  "Province",
  "Country",
  "Postal Code",
  "About Us",
  "Approval Status",
  "Approved Date",
  "Joined Date",
];

export function exportPartnerApplicationsCsv(partners = []) {
  downloadCsv({
    headers: CSV_HEADERS,
    rows: partners.map((member) => [
      member.organizationName || "",
      member.username || "",
      member.title || "",
      member.firstName || "",
      member.lastName || "",
      member.contactEmail || "",
      member.contactPhoneNumber || "",
      member.organizationEmail || "",
      member.organizationPhoneNumber || "",
      member.website || "",
      member.linkedin || "",
      member.facebook || "",
      member.twitter || "",
      member.address || "",
      member.city || "",
      member.province || "",
      member.country || "",
      member.postalCode || "",
      member.aboutUs || "",
      member.approvalStatus || "pending",
      formatDateLocale(member.approvedAt),
      formatDateLocale(member.createdAt),
    ]),
    filename: `partners-${todayIsoDate()}.csv`,
  });
}
