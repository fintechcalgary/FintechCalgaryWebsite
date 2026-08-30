import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  default: { log: vi.fn(), logUserAction: vi.fn(), logApiError: vi.fn() },
}));

vi.mock("@/lib/models/marketingApproval", () => ({
  createMarketingApproval: vi.fn(),
  getMarketingApprovals: vi.fn(),
}));

import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import {
  createMarketingApproval,
  getMarketingApprovals,
} from "@/lib/models/marketingApproval";
import { GET, POST } from "./route";
import { USER_ROLES } from "@/lib/constants";

function mockMarketingFile(name = "content.pdf") {
  return new File([new Uint8Array([1, 2, 3, 4])], name, {
    type: "application/pdf",
  });
}

function createFormDataRequest(entries) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.append(key, value);
  }
  return new Request("http://localhost/api/marketing-approvals", {
    method: "POST",
    body: formData,
  });
}

describe("GET /api/marketing-approvals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const req = new Request("http://localhost/api/marketing-approvals");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks marketing permissions", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.OUTREACH } });

    const req = new Request("http://localhost/api/marketing-approvals");
    const res = await GET(req);

    expect(res.status).toBe(403);
  });

  it("returns submissions for marketing role", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.MARKETING, email: "marketing@example.com" },
    });
    const items = [{ title: "Campaign Brief", status: "pending" }];
    getMarketingApprovals.mockResolvedValue(items);

    const req = new Request("http://localhost/api/marketing-approvals");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(items);
    expect(getMarketingApprovals).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        submittedBy: "marketing@example.com",
      }),
    );
  });

  it("returns all submissions for admin with approve permission", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.ADMIN, email: "admin@example.com" },
    });
    getMarketingApprovals.mockResolvedValue([]);

    const req = new Request("http://localhost/api/marketing-approvals");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(getMarketingApprovals).toHaveBeenCalledWith(
      expect.anything(),
      expect.not.objectContaining({ submittedBy: expect.anything() }),
    );
  });
});

describe("POST /api/marketing-approvals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const res = await POST(
      createFormDataRequest({
        title: "Campaign",
        partnerName: "Acme",
        contentFile: mockMarketingFile(),
        proofFile: mockMarketingFile("proof.pdf"),
      }),
    );

    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks MARKETING_SUBMIT permission", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.OUTREACH } });

    const res = await POST(
      createFormDataRequest({
        title: "Campaign",
        partnerName: "Acme",
        contentFile: mockMarketingFile(),
        proofFile: mockMarketingFile("proof.pdf"),
      }),
    );

    expect(res.status).toBe(403);
  });

  it("returns 400 when title is missing", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.MARKETING, email: "marketing@example.com" },
    });

    const res = await POST(
      createFormDataRequest({
        partnerName: "Acme",
        contentFile: mockMarketingFile(),
        proofFile: mockMarketingFile("proof.pdf"),
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Title is required");
  });

  it("returns 400 when content file is missing", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.MARKETING, email: "marketing@example.com" },
    });

    const res = await POST(
      createFormDataRequest({
        title: "Campaign",
        partnerName: "Acme",
        proofFile: mockMarketingFile("proof.pdf"),
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Marketing content file is required");
  });

  it("creates submission when authorized with valid payload", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.MARKETING, email: "marketing@example.com" },
    });
    const contentFile = mockMarketingFile();
    const proofFile = mockMarketingFile("proof.pdf");
    const created = { _id: "507f1f77bcf86cd799439011", title: "Campaign" };
    createMarketingApproval.mockResolvedValue(created);

    const res = await POST(
      createFormDataRequest({
        title: "Campaign",
        partnerName: "Acme",
        description: "Spring campaign",
        contentFile,
        proofFile,
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual(created);
    expect(createMarketingApproval).toHaveBeenCalledOnce();
    const [, payload] = createMarketingApproval.mock.calls[0];
    expect(payload.title).toBe("Campaign");
    expect(payload.partnerName).toBe("Acme");
    expect(payload.description).toBe("Spring campaign");
    expect(payload.submittedBy).toBe("marketing@example.com");
    expect(payload.contentFile.name).toBe("content.pdf");
    expect(payload.proofFile.name).toBe("proof.pdf");
  });
});
