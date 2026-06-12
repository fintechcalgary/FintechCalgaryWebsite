const HTML_ENTITY_MAP = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#039;": "'",
  "&#x27;": "'",
  "&apos;": "'",
};

/**
 * Strip HTML and control characters from user input. Used where only plain text
 * is allowed (e.g. chat messages) — avoids pulling jsdom into serverless.
 */
export function sanitizePlainText(input) {
  if (typeof input !== "string") return "";

  let text = input.replace(/<[^>]*>/g, "");

  text = text.replace(
    /&(?:lt|gt|amp|quot|apos|#039|#x27);/gi,
    (entity) => HTML_ENTITY_MAP[entity.toLowerCase()] ?? entity
  );

  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}
