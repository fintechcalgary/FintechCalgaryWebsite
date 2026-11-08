import Link from "next/link";

const TITLE_GRADIENT =
  "bg-clip-text text-transparent bg-gradient-to-br from-white via-violet-200 to-primary";

const TITLE_GLOW =
  "bg-clip-text text-transparent bg-gradient-to-br from-violet-300 via-primary to-purple-400";

const BRAND_FACE =
  "font-display font-bold leading-snug tracking-tight";

export function SectionHeading({
  children,
  href,
  className = "",
  sizeClass = "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
}) {
  const title = (
    <h2
      className={`mb-3 md:mb-4 ${BRAND_FACE} ${sizeClass} ${className}`.trim()}
    >
      <span className="relative inline-block">
        <span className={TITLE_GRADIENT}>{children}</span>
        <span
          className={`pointer-events-none absolute inset-0 ${TITLE_GLOW} opacity-0 blur-[6px] transition-opacity duration-500 group-hover:opacity-70`}
          aria-hidden
        >
          {children}
        </span>
      </span>
    </h2>
  );

  const underline = (
    <div className="relative mx-auto mt-1 h-[3px] w-24 overflow-hidden rounded-full md:mt-2 md:w-32">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-400/40 via-primary to-purple-400/40 opacity-60" />
      <div className="absolute inset-0 origin-center scale-x-50 rounded-full bg-gradient-to-r from-violet-300 via-primary to-purple-400 transition-transform duration-500 ease-out group-hover:scale-x-100" />
    </div>
  );

  const shellClass =
    "group relative inline-flex flex-col items-center text-center";

  if (href) {
    return (
      <Link href={href} className={shellClass}>
        {title}
        {underline}
      </Link>
    );
  }

  return (
    <div className={shellClass}>
      {title}
      {underline}
    </div>
  );
}

/** Marketing page hero — use on public routes; overrides default `h1` with gradient scale. */
export function PageHeading({
  children,
  className = "",
  sizeClass = "",
}) {
  const scale =
    sizeClass || "text-3xl sm:text-4xl md:text-5xl mb-6";
  return (
    <h1 className={`heading-hero ${scale} ${className}`.trim()}>{children}</h1>
  );
}

export const PageTitle = PageHeading;

export function AdminPageTitle({ className = "", children, ...props }) {
  return (
    <h1 className={`heading-accent ${className}`.trim()} {...props}>
      {children}
    </h1>
  );
}

export function AdminPageLede({ className = "", children, ...props }) {
  return (
    <p className={`text-lede ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export default SectionHeading;
