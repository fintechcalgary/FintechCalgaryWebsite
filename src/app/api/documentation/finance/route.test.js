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

vi.mock("@/lib/models/financeDocument", () => ({
  createFinanceDocument: vi.fn(),
  deleteFinanceDocument: vi.fn(),
  getFinanceDocuments: vi.fn(),
}));

import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import {
  createFinanceDocument,
  getFinanceDocuments,
} from "@/lib/models/financeDocument";
import { GET, POST } from "./route";
import { USER_ROLES } from "@/lib/constants";

function mockFinanceFile(name = "report.pdf") {
  return new File([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])], name, {
    type: "application/pdf",
  });
}

function createFormDataRequest(entries) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.append(key, value);
  }
  return new Request("http://localhost/api/documentation/finance", {
    method: "POST",
    body: formData,
  });
}

describe("GET /api/documentation/finance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks documentation permissions", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.OUTREACH } });

    const res = await GET();

    expect(res.status).toBe(403);
  });

  it("returns finance documents for finance role", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.FINANCE, email: "finance@example.com" },
    });
    const documents = [{ title: "Q1 Budget", type: "pdf" }];
    getFinanceDocuments.mockResolvedValue(documents);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(documents);
    expect(getFinanceDocuments).toHaveBeenCalledOnce();
  });
});

describe("POST /api/documentation/finance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const res = await POST(
      createFormDataRequest({
        title: "Budget Report",
        file: mockFinanceFile(),
      }),
    );

    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks DOCUMENTATION_FINANCE permission", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.EVENTS } });

    const res = await POST(
      createFormDataRequest({
        title: "Budget Report",
        file: mockFinanceFile(),
      }),
    );

    expect(res.status).toBe(403);
  });

  it("returns 400 when title is missing", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.FINANCE, email: "finance@example.com" },
    });

    const res = await POST(createFormDataRequest({ file: mockFinanceFile() }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Title is required");
  });

  it("returns 400 when file is missing", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.FINANCE, email: "finance@example.com" },
    });

    const res = await POST(createFormDataRequest({ title: "Budget Report" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("A finance document file is required");
  });

  it("creates finance document when authorized with valid payload", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.FINANCE, email: "finance@example.com" },
    });
    const file = mockFinanceFile();
    const created = { _id: "507f1f77bcf86cd799439011", title: "Budget Report" };
    createFinanceDocument.mockResolvedValue(created);

    const res = await POST(
      createFormDataRequest({
        title: "Budget Report",
        description: "Q1 summary",
        file,
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual(created);
    expect(createFinanceDocument).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: "Budget Report",
        description: "Q1 summary",
        uploadedBy: "finance@example.com",
        file: expect.objectContaining({ name: "report.pdf" }),
      }),
    );
  });
});
