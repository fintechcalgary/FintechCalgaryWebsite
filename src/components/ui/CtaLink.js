import Link from "next/link";
import {
  btnMarketingPrimary,
  btnMarketingSecondary,
  btnMarketingSoft,
} from "@/lib/uiClassNames";

const VARIANT_CLASS = {
  primary: btnMarketingPrimary,
  secondary: btnMarketingSecondary,
  soft: btnMarketingSoft,
};

/** Marketing-site CTA styled as Next.js Link. */
export default function CtaLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <Link
      href={href}
      className={`${VARIANT_CLASS[variant] ?? btnMarketingPrimary} ${className}`.trim()}
      {...props}
    >
      {children}
    </Link>
  );
}
