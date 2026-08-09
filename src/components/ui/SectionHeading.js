import Link from "next/link";

const GRADIENT =
  "bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400/75";

/**
 * Landing-section gradient heading with centered hover underline (linked).
 */
export function SectionHeading({
  children,
  href,
  as: Tag = "h2",
  className = "",
  sizeClass = "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight",
}) {
  const title = (
    <Tag className={`${sizeClass} mb-4 md:mb-6 ${className}`.trim()}>
      <span className="relative inline-block">
        <span className={GRADIENT}>{children}</span>
        <span
          className={`absolute inset-0 ${GRADIENT} opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300`}
          aria-hidden
        >
          {children}
        </span>
      </span>
    </Tag>
  );

  const underline = (
    <div className="relative mx-auto mt-2 h-1 w-full max-w-xs md:mt-3">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm" />
      <div className="relative h-full origin-center scale-x-0 rounded-full bg-gradient-to-r from-primary to-purple-400/75 transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group relative inline-block">
        {title}
        {underline}
      </Link>
    );
  }

  return (
    <div className="group relative inline-block">
      {title}
      {underline}
    </div>
  );
}

/**
 * Page-level gradient H1 used across public routes.
 */
export function PageTitle({
  children,
  as: Tag = "h1",
  className = "",
  sizeClass = "text-4xl md:text-5xl font-extrabold",
}) {
  return (
    <Tag className={`${sizeClass} ${GRADIENT} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export default SectionHeading;
