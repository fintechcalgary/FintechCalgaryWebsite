"use client";

const VARIANT_CLASSES = {
  primary:
    "fc-btn-gradient-primary px-6 py-3 shadow-lg hover:-translate-y-0.5 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900",
  secondary:
    "bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl border border-gray-700/50 hover:border-gray-600/50 px-6 py-3 font-medium text-sm focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900",
  danger:
    "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl px-6 py-3 font-medium text-sm shadow-lg shadow-red-500/20 hover:shadow-xl hover:-translate-y-0.5",
  cancel: "fc-btn-dashboard-cancel",
  ghost:
    "bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white rounded-xl px-4 py-2 text-sm transition-colors",
  success:
    "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-6 py-3 font-medium text-sm shadow-lg shadow-green-500/20",
};

/**
 * Shared button with variants mapped to existing .fc-* / Tailwind patterns.
 */
export default function Button({
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
  children,
  ...props
}) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${variantClass} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
