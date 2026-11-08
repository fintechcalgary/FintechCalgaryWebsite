import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { backLink, backLinkIcon } from "@/lib/uiClassNames";

const SPACING_CLASS = {
  default: "mb-6",
  none: "mb-0",
  tight: "mb-4",
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
  const alignClass = align === "center" ? "w-full justify-center" : "";
  return `${backLink} ${spacingClass} group ${alignClass} ${className}`.trim();
}

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
        className={`${backLinkIcon} ${iconClassName}`.trim()}
        aria-hidden
      />
      <span>{label}</span>
    </Link>
  );
}

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
        className={`${backLinkIcon} ${iconClassName}`.trim()}
        aria-hidden
      />
      <span>{label}</span>
    </button>
  );
}

export function AdminBackLink({
  href = "/dashboard",
  label = "Back to Dashboard",
  className = "",
  ...props
}) {
  return (
    <BackLink href={href} label={label} className={className} {...props} />
  );
}
