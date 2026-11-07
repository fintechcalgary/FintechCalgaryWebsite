/**
 * Normalize a date string to local midnight for day-level comparisons.
 */
export function normalizeDate(dateString) {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Today's date at local midnight.
 */
export function startOfToday() {
  const currentDate = new Date();
  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
}

/**
 * Today's date as YYYY-MM-DD (useful for export filenames).
 */
export function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Short article/admin date: "Jan 5, 2026"
 */
export function formatDateShort(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Long prose date: "January 5, 2026"
 */
export function formatDateLong(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Compact month/day: "Jan 5"
 */
export function formatDateMonthDay(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Date + time: "January 5, 2026, 03:45 PM"
 */
export function formatDateTime(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Compact date + time: "Jan 5, 2026, 03:45 PM"
 */
export function formatDateTimeShort(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Event calendar date (date-only strings treated as local midnight).
 */
export function formatEventDate(dateString) {
  if (!dateString) return "";
  const value = String(dateString).includes("T")
    ? dateString
    : `${dateString}T00:00:00`;
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Browser-locale short date (admin tables / CSV).
 */
export function formatDateLocale(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
}

/**
 * Relative time for "last updated" lines: "Just now", "5 minutes ago", etc.
 */
export function formatRelativeTime(date) {
  if (!date) return "Never";
  const then = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(then.getTime())) return "Never";

  const diff = Date.now() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
