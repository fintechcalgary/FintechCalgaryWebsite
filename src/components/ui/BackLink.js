import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const SPACING_CLASS = {
  default: "",
  none: "fc-back-link--flush",
  tight: "fc-back-link--tight",
};

/**
 * @param {"default" | "none" | "tight"} [spacing]
 * @param {"start" | "center"} [align]
 */
export function backLinkClassName({
  className = "",
  spacing = "default",
  align = "start",
} = {}) {
  const spacingClass = SPACING_CLASS[spacing] ?? SPACING_CLASS.default;
  const alignClass = align === "center" ? "fc-back-link--center" : "";
  return `fc-back-link group ${spacingClass} ${alignClass} ${className}`.trim();
}

/**
 * Standard site-wide back navigation (public + admin).
 */
export default function BackLink({
  href,
  label,
  className = "",
  iconClassName = "",
  spacing = "default",
  align = "start",
  ...props
}) {
  return (
    <Link
      href={href}
      className={backLinkClassName({ className, spacing, align })}
      {...props}
    >
      <FiArrowLeft
        className={`fc-back-link__icon ${iconClassName}`.trim()}
        aria-hidden
      />
      <span>{label}</span>
    </Link>
  );
}

/** Same look as BackLink for in-page / modal back actions. */
export function BackButton({
  label,
  className = "",
  iconClassName = "",
  spacing = "default",
  align = "start",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={backLinkClassName({ className, spacing, align })}
      {...props}
    >
      <FiArrowLeft
        className={`fc-back-link__icon ${iconClassName}`.trim()}
        aria-hidden
      />
      <span>{label}</span>
    </button>
  );
}

/** Dashboard default — same styles as BackLink. */
export function AdminBackLink({
  href = "/dashboard",
  label = "Back to Dashboard",
  className = "",
  ...props
}) {
  return (
    <BackLink
      href={href}
      label={label}
      className={className}
      {...props}
    />
  );
}
