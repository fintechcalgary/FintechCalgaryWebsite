import SectionHeading from "@/components/ui/SectionHeading";

export const LANDING_SECTION_CLASS = "relative overflow-x-clip py-24";

export const LANDING_CONTAINER_CLASS =
  "container relative z-10 mx-auto max-w-6xl px-6 sm:px-8 lg:px-12";

/** Full-bleed container for marquees that should run to the section edges. */
export const LANDING_CONTAINER_WIDE_CLASS =
  "container relative z-10 mx-auto px-6 sm:px-8 lg:px-12";

export const LANDING_HEADER_CLASS = "mb-16 text-center md:mb-20";

export function LandingSection({ id, children, className = "" }) {
  return (
    <section
      id={id}
      className={`${LANDING_SECTION_CLASS} ${className}`.trim()}
    >
      {children}
    </section>
  );
}

export function LandingContainer({ children, wide = false, className = "" }) {
  const width = wide ? LANDING_CONTAINER_WIDE_CLASS : LANDING_CONTAINER_CLASS;
  return <div className={`${width} ${className}`.trim()}>{children}</div>;
}

export function LandingSectionHeader({ href, children }) {
  return (
    <div className={LANDING_HEADER_CLASS}>
      <SectionHeading href={href}>{children}</SectionHeading>
    </div>
  );
}
