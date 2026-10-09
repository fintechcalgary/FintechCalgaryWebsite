"use client";

/**
 * Shared empty / zero-data panel for public (fc-card) and admin (fc-admin-panel).
 */
export default function EmptyState({
  variant = "admin",
  icon: Icon,
  title,
  children,
  action,
  className = "",
  minHeightClass = "min-h-[240px]",
}) {
  const shell = variant === "public" ? "fc-card" : "fc-admin-panel";

  return (
    <div
      className={`${shell} flex flex-col items-center justify-center px-6 py-12 text-center ${minHeightClass} ${className}`.trim()}
    >
      {Icon ? (
        <Icon className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden />
      ) : null}
      {title ? <p className="fc-title mb-2 text-lg">{title}</p> : null}
      {children ? <div className="fc-muted max-w-md">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
