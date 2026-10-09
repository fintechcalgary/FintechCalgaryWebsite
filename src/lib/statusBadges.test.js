import { describe, it, expect } from "vitest";
import {
  TONE_CLASSES,
  SIZE_CLASSES,
  getApprovalStatusMeta,
  getMarketingStatusMeta,
  getContractStatusMeta,
} from "@/lib/statusBadges";

describe("TONE_CLASSES", () => {
  it("exports expected tone keys", () => {
    expect(Object.keys(TONE_CLASSES).sort()).toEqual(
      [
        "danger",
        "info",
        "muted",
        "neutral",
        "primary",
        "success",
        "warning",
      ].sort(),
    );
  });
});

describe("SIZE_CLASSES", () => {
  it("exports sm, md, and lg keys", () => {
    expect(Object.keys(SIZE_CLASSES).sort()).toEqual(["lg", "md", "sm"]);
  });
});

describe("getApprovalStatusMeta", () => {
  it("returns success meta for accepted", () => {
    const meta = getApprovalStatusMeta("accepted");
    expect(meta).toMatchObject({
      tone: "success",
      label: "Approved",
      shortLabel: "Accepted",
    });
    expect(meta.colorClass).toBe(TONE_CLASSES.success);
    expect(meta.badgeClass).toBe(TONE_CLASSES.success);
  });

  it("returns danger meta for rejected", () => {
    const meta = getApprovalStatusMeta("rejected");
    expect(meta).toMatchObject({
      tone: "danger",
      label: "Rejected",
      shortLabel: "Rejected",
    });
    expect(meta.colorClass).toBe(TONE_CLASSES.danger);
    expect(meta.badgeClass).toBe(TONE_CLASSES.danger);
  });

  it("returns warning meta for pending", () => {
    const meta = getApprovalStatusMeta("pending");
    expect(meta).toMatchObject({
      tone: "warning",
      label: "Awaiting Approval",
      shortLabel: "Pending",
    });
    expect(meta.colorClass).toBe(TONE_CLASSES.warning);
    expect(meta.badgeClass).toBe(TONE_CLASSES.warning);
  });

  it("falls back to pending for unknown status", () => {
    const meta = getApprovalStatusMeta("unknown");
    expect(meta).toMatchObject({
      tone: "warning",
      label: "Awaiting Approval",
      shortLabel: "Pending",
    });
    expect(meta.colorClass).toBe(TONE_CLASSES.warning);
    expect(meta.badgeClass).toBe(TONE_CLASSES.warning);
  });
});

describe("getMarketingStatusMeta", () => {
  it("returns warning meta for pending", () => {
    const meta = getMarketingStatusMeta("pending");
    expect(meta).toMatchObject({
      tone: "warning",
      label: "Pending Review",
    });
    expect(meta.className).toBe(TONE_CLASSES.warning);
  });

  it("returns success meta for approved", () => {
    const meta = getMarketingStatusMeta("approved");
    expect(meta).toMatchObject({
      tone: "success",
      label: "Approved",
    });
    expect(meta.className).toBe(TONE_CLASSES.success);
  });

  it("returns danger meta for rejected", () => {
    const meta = getMarketingStatusMeta("rejected");
    expect(meta).toMatchObject({
      tone: "danger",
      label: "Rejected",
    });
    expect(meta.className).toBe(TONE_CLASSES.danger);
  });

  it("falls back to pending for unknown status", () => {
    const meta = getMarketingStatusMeta("unknown");
    expect(meta).toMatchObject({
      tone: "warning",
      label: "Pending Review",
    });
    expect(meta.className).toBe(TONE_CLASSES.warning);
  });
});

describe("getContractStatusMeta", () => {
  it("returns info meta for active", () => {
    const meta = getContractStatusMeta("active");
    expect(meta).toMatchObject({
      tone: "info",
      label: "In Progress",
    });
    expect(meta.className).toBe(TONE_CLASSES.info);
  });

  it("returns success meta for completed", () => {
    const meta = getContractStatusMeta("completed");
    expect(meta).toMatchObject({
      tone: "success",
      label: "Completed",
    });
    expect(meta.className).toBe(TONE_CLASSES.success);
  });

  it("returns danger meta for do-not-proceed", () => {
    const meta = getContractStatusMeta("do-not-proceed");
    expect(meta).toMatchObject({
      tone: "danger",
      label: "Do Not Proceed",
    });
    expect(meta.className).toBe(TONE_CLASSES.danger);
  });

  it("returns neutral meta for unknown status", () => {
    const meta = getContractStatusMeta("unknown");
    expect(meta).toMatchObject({
      tone: "neutral",
      label: "unknown",
    });
    expect(meta.className).toBe(TONE_CLASSES.neutral);
  });
});
