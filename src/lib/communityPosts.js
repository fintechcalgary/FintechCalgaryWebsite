import { sanitizePlainText } from "@/lib/sanitizePlainText";
import { normalizeDate, startOfToday } from "@/lib/dates";

const TEXT_FIELDS = [
  "title",
  "description",
  "eventDate",
  "eventTime",
  "organizationName",
  "location",
];

const URL_FIELDS = ["bannerUrl", "registrationUrl"];

export const COMMUNITY_POST_FIELDS = [...TEXT_FIELDS, ...URL_FIELDS];

/** Hosts allowed by next/image remotePatterns in next.config.mjs */
const ALLOWED_BANNER_HOST_PATTERNS = [
  /^res\.cloudinary\.com$/i,
  /^[\w-]+\.cloudinary\.com$/i,
  /^images\.unsplash\.com$/i,
  /^cdn\.pixabay\.com$/i,
  /^picsum\.photos$/i,
];

const EVENT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function toIsoString(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === "string") return value;
  if (typeof value?.toISOString === "function") {
    try {
      return value.toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

export function isValidEventDate(value) {
  if (!EVENT_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isAllowedBannerUrl(value) {
  if (!value) return true;
  if (!isValidHttpUrl(value)) return false;
  try {
    const { hostname } = new URL(value);
    return ALLOWED_BANNER_HOST_PATTERNS.some((pattern) =>
      pattern.test(hostname),
    );
  } catch {
    return false;
  }
}

export function serializeCommunityPost(post) {
  if (!post) return null;

  return {
    _id: post._id?.toString?.() ?? post._id,
    title: post.title ?? "",
    description: post.description ?? "",
    eventDate: post.eventDate ?? "",
    eventTime: post.eventTime ?? "",
    organizationName: post.organizationName ?? "",
    location: post.location ?? "",
    bannerUrl: post.bannerUrl ?? "",
    registrationUrl: post.registrationUrl ?? "",
    createdById: post.createdById ?? "",
    createdByName: post.createdByName ?? "",
    createdByRole: post.createdByRole ?? "",
    createdAt: toIsoString(post.createdAt),
    updatedAt: toIsoString(post.updatedAt),
  };
}

export function normalizeCommunityPostPayload(body = {}) {
  const payload = {};
  for (const field of TEXT_FIELDS) {
    payload[field] = sanitizePlainText(body[field] || "");
  }
  for (const field of URL_FIELDS) {
    payload[field] =
      typeof body[field] === "string" ? body[field].trim() : "";
  }
  return payload;
}

export function validateCommunityPostPayload(payload) {
  const requiredLabels = {
    title: "Title",
    description: "Description",
    eventDate: "Event date",
    registrationUrl: "Registration link",
  };

  for (const [field, label] of Object.entries(requiredLabels)) {
    if (!payload[field]) return `${label} is required`;
  }

  if (!isValidEventDate(payload.eventDate)) {
    return "Event date must be a valid YYYY-MM-DD date";
  }

  if (!isValidHttpUrl(payload.registrationUrl)) {
    return "Registration link must be a valid http or https URL";
  }

  if (payload.bannerUrl && !isAllowedBannerUrl(payload.bannerUrl)) {
    return "Banner URL must be a valid image URL from an allowed host";
  }

  return null;
}

export function toCommunityPostFormState(post = null) {
  if (!post) {
    return {
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      organizationName: "",
      location: "",
      bannerUrl: "",
      registrationUrl: "",
    };
  }

  return {
    title: post.title || "",
    description: post.description || "",
    eventDate: post.eventDate ? String(post.eventDate).split("T")[0] : "",
    eventTime: post.eventTime || "",
    organizationName: post.organizationName || "",
    location: post.location || "",
    bannerUrl: post.bannerUrl || "",
    registrationUrl: post.registrationUrl || "",
  };
}

/**
 * Filter and sort posts for the public board.
 * @param {"upcoming"|"past"|"all"} filter
 */
export function filterCommunityPosts(
  posts,
  filter = "upcoming",
  today = startOfToday(),
) {
  return [...posts]
    .filter((post) => {
      if (!post.eventDate || !isValidEventDate(String(post.eventDate).split("T")[0])) {
        return filter === "all";
      }
      const eventDate = normalizeDate(post.eventDate);
      if (filter === "upcoming") return eventDate >= today;
      if (filter === "past") return eventDate < today;
      return true;
    })
    .sort((a, b) => {
      const aDate = a.eventDate ? normalizeDate(a.eventDate) : new Date(0);
      const bDate = b.eventDate ? normalizeDate(b.eventDate) : new Date(0);
      return filter === "past" ? bDate - aDate : aDate - bDate;
    });
}
