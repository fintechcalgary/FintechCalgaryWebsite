"use client";

const VARIANT_CLASSES = {
  edit: "rounded-xl border border-transparent p-2 text-gray-400 transition-all duration-200 hover:scale-105 hover:border-primary/20 hover:bg-primary/10 hover:text-primary",
  danger:
    "rounded-xl border border-transparent p-2 text-gray-400 transition-all duration-200 hover:scale-105 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400",
  ghost:
    "rounded-xl border border-transparent p-2 text-gray-400 transition-all duration-200 hover:bg-gray-800/50 hover:text-white",
  soft: "rounded-xl border border-gray-600/50 bg-gray-800/50 p-2.5 text-gray-300 transition-colors hover:border-primary/40 hover:text-primary",
  "soft-danger":
    "rounded-xl border border-gray-600/50 bg-gray-800/50 p-2.5 text-gray-300 transition-colors hover:border-red-400/40 hover:text-red-300",
};

/**
 * Shared icon-only control for edit / delete / ghost actions.
 */
export default function IconButton({
  variant = "ghost",
  type = "button",
  className = "",
  disabled = false,
  label,
  children,
  ...props
}) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.ghost;

  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${variantClass} disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
