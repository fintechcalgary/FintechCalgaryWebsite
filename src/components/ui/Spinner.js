/**
 * Loading spinner matching the existing primary-border spin pattern.
 */
export default function Spinner({ size = "md", className = "" }) {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 border-t-2 border-b-2"
      : size === "lg"
        ? "h-16 w-16 border-t-4 border-b-4"
        : "h-12 w-12 border-t-4 border-b-4";

  return (
    <div
      className={`animate-spin rounded-full border-primary ${sizeClass} ${className}`.trim()}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Full-area centered loading state.
 */
export function LoadingState({
  size = "lg",
  className = "",
  message,
  fullScreen = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-screen" : "py-16"
      } ${className}`.trim()}
    >
      <Spinner size={size} />
      {message ? <p className="text-gray-400 text-sm">{message}</p> : null}
    </div>
  );
}
