/**
 * Shared partner organization form field config and helpers.
 */

export const INITIAL_PARTNER_FORM = {
  organizationName: "",
  username: "",
  password: "",
  title: "",
  firstName: "",
  lastName: "",
  contactEmail: "",
  contactPhoneNumber: "",
  organizationEmail: "",
  organizationPhoneNumber: "",
  website: "",
  facebook: "",
  twitter: "",
  linkedin: "",
  address: "",
  country: "",
  province: "",
  city: "",
  postalCode: "",
  aboutUs: "",
  logo: null,
};

export const PARTNER_FORM_INPUT_CLASS =
  "w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-gray-600/50";

/**
 * Map an API member/application record into partner form values.
 */
export function memberToPartnerForm(member = {}) {
  return {
    organizationName: member.organizationName || "",
    username: member.username || "",
    password: "",
    title: member.title || "",
    firstName: member.firstName || "",
    lastName: member.lastName || "",
    contactEmail: member.contactEmail || "",
    contactPhoneNumber: member.contactPhoneNumber || "",
    organizationEmail: member.organizationEmail || "",
    organizationPhoneNumber: member.organizationPhoneNumber || "",
    website: member.website || "",
    facebook: member.facebook || "",
    twitter: member.twitter || "",
    linkedin: member.linkedin || "",
    address: member.address || "",
    country: member.country || "",
    province: member.province || "",
    city: member.city || "",
    postalCode: member.postalCode || "",
    aboutUs: member.aboutUs || "",
    logo: null,
  };
}

/**
 * Admin partner-application edit form (org fields + approval metadata).
 */
export function memberToPartnerApplicationForm(member = {}) {
  const form = memberToPartnerForm(member);
  delete form.password;
  delete form.logo;
  return {
    ...form,
    approvalStatus: member.approvalStatus || "pending",
    approvedAt: member.approvedAt || null,
  };
}

export const INITIAL_PARTNER_APPLICATION_FORM = memberToPartnerApplicationForm();

/**
 * Create a field change handler that merges into form state and clears errors.
 */
export function createPartnerFieldChangeHandler(setValues, setErrors) {
  return (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (setErrors) {
      setErrors((prev) => {
        if (!prev?.[field]) return prev;
        return { ...prev, [field]: null };
      });
    }
  };
}
