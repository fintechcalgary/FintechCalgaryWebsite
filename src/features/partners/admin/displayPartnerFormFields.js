export const INITIAL_DISPLAY_PARTNER_FORM = {
  name: "",
  description: "",
  website: "",
  color: "#8b5cf6",
  logo: "",
};

export function partnerToDisplayForm(partner = {}) {
  return {
    name: partner.name || "",
    description: partner.description || "",
    website: partner.website || "",
    color: partner.color || "#8b5cf6",
    logo: partner.logo || "",
  };
}

export function normalizeHexColor(value, fallback = "#8b5cf6") {
  let next = (value || "").trim();
  if (next && !next.startsWith("#")) next = `#${next}`;
  return next || fallback;
}

export function displayColorValue(color) {
  if (!color) return "#8b5cf6";
  return color.startsWith("#") ? color : `#${color}`;
}
