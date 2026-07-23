import Link from "next/link";

const GRADIENT =
  "bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400/75";

/**
 * Landing-section gradient heading with optional hover underline (linked).
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
      <span className="relative inline-block group">
        <span className={`${GRADIENT} animate-gradient`}>{children}</span>
        <span
          className={`absolute inset-0 ${GRADIENT} blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
          aria-hidden
        >
          {children}
        </span>
        <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-primary to-purple-400/75 group-hover:w-full transition-all duration-500 rounded-full" />
      </span>
    </Tag>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-block relative">
        {title}
      </Link>
    );
  }

  return title;
}

/**
 * Page-level gradient H1 used across public routes.
 */
export function PageTitle({
  children,
  as: Tag = "h1",
  className = "",
  sizeClass = "text-4xl md:text-5xl font-bold",
}) {
  return (
    <Tag className={`${sizeClass} ${GRADIENT} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export default SectionHeading;
