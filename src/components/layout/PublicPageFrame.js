import { PageTitle } from "@/components/ui/SectionHeading";

/** Shared public-page gutter: clears the fixed navbar and matches side padding. */
export const PUBLIC_PAGE_GUTTER =
  "container relative z-10 mx-auto px-6 pb-24 pt-36 sm:px-8 lg:px-12";

export const PUBLIC_TITLE_SIZE = "text-3xl sm:text-4xl md:text-5xl mb-6";

/**
 * Standard public page column under the navbar.
 */
export function PublicPageFrame({ children, className = "" }) {
  return (
    <div className="relative flex-grow">
      <div className={`${PUBLIC_PAGE_GUTTER} ${className}`.trim()}>
        {children}
      </div>
    </div>
  );
}

/**
 * Centered page title and intro used on marketing routes.
 * Extra nodes render under the lede (filters, meta lines).
 */
export function PublicPageHeader({ title, lede, children, className = "" }) {
  return (
    <div className={`mb-16 animate-fadeIn text-center ${className}`.trim()}>
      <PageTitle sizeClass={PUBLIC_TITLE_SIZE}>{title}</PageTitle>
      {lede ? <p className="fc-lede mx-auto max-w-3xl">{lede}</p> : null}
      {children}
    </div>
  );
}
