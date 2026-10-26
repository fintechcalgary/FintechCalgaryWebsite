import { describe, it, expect } from "vitest";
import { serializeFinanceDocument } from "@/lib/models/financeDocument";
import { serializeMarketingApproval } from "@/lib/models/marketingApproval";
import { MARKETING_APPROVAL_STATUS } from "@/lib/constants";

describe("finance document model", () => {
  it("serializes document without binary file data", () => {
    const doc = {
      _id: { toString: () => "abc123" },
      title: "Q1 Budget",
      description: "Club finances",
      section: "finance",
      uploadedBy: "finance",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      file: {
        filename: "budget.xlsx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 1024,
        uploadedAt: new Date("2026-01-01"),
        data: Buffer.from("secret"),
      },
    };

    const serialized = serializeFinanceDocument(doc);
    expect(serialized._id).toBe("abc123");
    expect(serialized.title).toBe("Q1 Budget");
    expect(serialized.file.filename).toBe("budget.xlsx");
    expect(serialized.file.data).toBeUndefined();
  });
});

describe("marketing approval model", () => {
  it("serializes submission with pending status", () => {
    const item = {
      _id: { toString: () => "sub1" },
      title: "Partner Banner",
      description: "Social media post",
      partnerName: "Acme Corp",
      status: MARKETING_APPROVAL_STATUS.PENDING,
      submittedBy: "marketing",
      reviewedBy: null,
      reviewNote: "",
      reviewedAt: null,
      createdAt: new Date("2026-02-01"),
      updatedAt: new Date("2026-02-01"),
      contentFile: {
        filename: "banner.png",
        mimeType: "image/png",
        size: 2048,
        uploadedAt: new Date("2026-02-01"),
        data: Buffer.from("img"),
      },
      proofFile: {
        filename: "approval.eml",
        mimeType: "message/rfc822",
        size: 512,
        uploadedAt: new Date("2026-02-01"),
        data: Buffer.from("email"),
      },
    };

    const serialized = serializeMarketingApproval(item);
    expect(serialized.status).toBe(MARKETING_APPROVAL_STATUS.PENDING);
    expect(serialized.contentFile.filename).toBe("banner.png");
    expect(serialized.proofFile.filename).toBe("approval.eml");
    expect(serialized.contentFile.data).toBeUndefined();
  });
});
