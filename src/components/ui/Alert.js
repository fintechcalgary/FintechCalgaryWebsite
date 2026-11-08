import { alertError, alertSuccess, alertWarning } from "@/lib/uiClassNames";

const VARIANT_CLASS = {
  error: alertError,
  success: alertSuccess,
  warning: alertWarning,
};

export default function Alert({
  variant = "error",
  className = "",
  children,
  ...props
}) {
  return (
    <div
      role="alert"
      className={`${VARIANT_CLASS[variant] ?? alertError} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
