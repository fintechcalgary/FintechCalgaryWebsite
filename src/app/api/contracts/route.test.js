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

vi.mock("@/lib/models/contract", () => ({
  createContract: vi.fn(),
  getContracts: vi.fn(),
  buildEoiPdf: vi.fn(),
}));

import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import { createContract, getContracts } from "@/lib/models/contract";
import { GET, POST } from "./route";
import { USER_ROLES } from "@/lib/constants";

function createFormDataRequest(entries) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.append(key, value);
  }
  return new Request("http://localhost/api/contracts", {
    method: "POST",
    body: formData,
  });
}

describe("GET /api/contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks CONTRACTS permission", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.EVENTS } });

    const res = await GET();

    expect(res.status).toBe(403);
  });

  it("returns contracts list for authorized user", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.OUTREACH } });
    const contracts = [{ title: "Partnership Agreement" }];
    getContracts.mockResolvedValue(contracts);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(contracts);
    expect(getContracts).toHaveBeenCalledOnce();
  });
});

describe("POST /api/contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue({});
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const res = await POST(
      createFormDataRequest({ title: "Contract", partnerName: "Acme" }),
    );

    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks CONTRACTS permission", async () => {
    getServerSession.mockResolvedValue({ user: { role: USER_ROLES.MARKETING } });

    const res = await POST(
      createFormDataRequest({ title: "Contract", partnerName: "Acme" }),
    );

    expect(res.status).toBe(403);
  });

  it("returns 400 when title is missing", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.OUTREACH, email: "staff@example.com" },
    });

    const res = await POST(createFormDataRequest({ partnerName: "Acme" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Title is required");
  });

  it("returns 400 when partner name is missing", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.OUTREACH, email: "staff@example.com" },
    });

    const res = await POST(createFormDataRequest({ title: "Contract" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Partner name is required");
  });

  it("creates contract when authorized with valid payload", async () => {
    getServerSession.mockResolvedValue({
      user: { role: USER_ROLES.OUTREACH, email: "staff@example.com" },
    });
    createContract.mockResolvedValue({ insertedId: "507f1f77bcf86cd799439011" });

    const res = await POST(
      createFormDataRequest({
        title: "Partnership Agreement",
        partnerName: "Acme Corp",
        description: "Annual partnership",
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual({ insertedId: "507f1f77bcf86cd799439011" });
    expect(createContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: "Partnership Agreement",
        partnerName: "Acme Corp",
        description: "Annual partnership",
        createdBy: "staff@example.com",
        eoiPdf: null,
      }),
    );
  });
});
