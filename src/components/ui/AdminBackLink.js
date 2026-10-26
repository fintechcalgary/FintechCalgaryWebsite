"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

/**
 * Shared admin-panel back control (matches Community dashboard style).
 */
export default function AdminBackLink({
  href = "/dashboard",
  label = "Back to Dashboard",
  className = "",
}) {
  return (
    <Link href={href} className={`fc-admin-back ${className}`.trim()}>
      <FiArrowLeft className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}
