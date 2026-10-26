import { describe, it, expect, vi, afterEach } from "vitest";
import {
  normalizeDate,
  startOfToday,
  todayIsoDate,
  formatDateShort,
  formatDateLong,
  formatDateMonthDay,
  formatDateTime,
  formatDateTimeShort,
  formatEventDate,
  formatDateLocale,
} from "@/lib/dates";

describe("normalizeDate", () => {
  it("strips time component and returns local midnight", () => {
    const result = normalizeDate("2026-03-15T14:30:00");
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});

describe("startOfToday", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today at local midnight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-29T15:45:00"));

    const result = startOfToday();
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(7);
    expect(result.getDate()).toBe(29);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});

describe("todayIsoDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns YYYY-MM-DD for the current UTC date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-29T15:45:00Z"));

    expect(todayIsoDate()).toBe("2026-08-29");
  });
});

describe("formatDateShort", () => {
  it("returns empty string for falsy input", () => {
    expect(formatDateShort("")).toBe("");
    expect(formatDateShort(null)).toBe("");
  });

  it("formats as short month, day, year", () => {
    expect(formatDateShort("2026-01-05T12:00:00")).toBe("Jan 5, 2026");
  });
});

describe("formatDateLong", () => {
  it("returns empty string for falsy input", () => {
    expect(formatDateLong("")).toBe("");
  });

  it("formats as long month, day, year", () => {
    expect(formatDateLong("2026-01-05T12:00:00")).toBe("January 5, 2026");
  });
});

describe("formatDateMonthDay", () => {
  it("returns empty string for falsy input", () => {
    expect(formatDateMonthDay("")).toBe("");
  });

  it("formats as short month and day only", () => {
    expect(formatDateMonthDay("2026-01-05T12:00:00")).toBe("Jan 5");
  });
});

describe("formatDateTime", () => {
  it("returns empty string for falsy input", () => {
    expect(formatDateTime("")).toBe("");
  });

  it("includes date and time components", () => {
    const result = formatDateTime("2026-01-05T15:45:00");
    expect(result).toContain("January 5, 2026");
    expect(result).toMatch(/03:45 PM|3:45 PM/);
  });
});

describe("formatDateTimeShort", () => {
  it("returns empty string for falsy input", () => {
    expect(formatDateTimeShort("")).toBe("");
  });

  it("includes short date and time components", () => {
    const result = formatDateTimeShort("2026-01-05T15:45:00");
    expect(result).toContain("Jan 5, 2026");
    expect(result).toMatch(/03:45 PM|3:45 PM/);
  });
});

describe("formatEventDate", () => {
  it("returns empty string for falsy input", () => {
    expect(formatEventDate("")).toBe("");
  });

  it("treats date-only strings as local midnight", () => {
    const result = formatEventDate("2026-01-05");
    expect(result).toContain("January 5, 2026");
    expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
  });

  it("handles ISO datetime strings", () => {
    const result = formatEventDate("2026-01-05T00:00:00");
    expect(result).toContain("January 5, 2026");
  });
});

describe("formatDateLocale", () => {
  it("returns empty string for falsy input", () => {
    expect(formatDateLocale("")).toBe("");
  });

  it("returns a locale-formatted date string", () => {
    const result = formatDateLocale("2026-01-05");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});
