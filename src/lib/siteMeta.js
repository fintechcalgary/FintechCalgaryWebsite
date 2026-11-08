/** Public site branding and document title helpers. */

export const SITE_NAME = "FinTech Calgary";

const TITLE_SUFFIX = ` | ${SITE_NAME}`;

/** Client-side document.title (includes brand suffix). */
export function formatPageTitle(section) {
  if (!section) return SITE_NAME;
  return `${section}${TITLE_SUFFIX}`;
}

/** Short title for Next metadata when layout template adds the suffix. */
export function metadataSectionTitle(section) {
  return section;
}
