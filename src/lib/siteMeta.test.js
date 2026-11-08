import { describe, it, expect } from "vitest";
import { SITE_NAME, formatPageTitle } from "@/lib/siteMeta";

describe("siteMeta", () => {
  it("formats client document titles with brand suffix", () => {
    expect(SITE_NAME).toBe("FinTech Calgary");
    expect(formatPageTitle("Partner Dashboard")).toBe(
      "Partner Dashboard | FinTech Calgary"
    );
    expect(formatPageTitle()).toBe("FinTech Calgary");
  });
});
