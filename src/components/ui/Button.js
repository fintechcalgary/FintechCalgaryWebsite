"use client";

import {
  btnChip,
  btnDashboardCancel,
  btnDangerSoft,
  btnGradientPrimary,
  btnSoftChip,
  btnSuccessSoft,
} from "@/lib/uiClassNames";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900";

const VARIANT_CLASSES = {
  primary: `${btnGradientPrimary} px-6 py-3 ${FOCUS_RING}`.trim(),
  secondary: `inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900`.trim(),
  danger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-red-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl hover:shadow-red-500/30 active:translate-y-0 active:scale-[0.98]",
  cancel: btnDashboardCancel,
  soft: btnSoftChip,
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-white active:scale-[0.98]",
  success:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl hover:shadow-emerald-500/30 active:translate-y-0 active:scale-[0.98]",
  "success-soft": btnSuccessSoft,
  "danger-soft": btnDangerSoft,
  chip: btnChip,
};

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
      className={`${variantClass} transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
