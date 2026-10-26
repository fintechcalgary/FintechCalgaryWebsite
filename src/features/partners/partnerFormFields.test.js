import { describe, it, expect, vi } from "vitest";
import {
  PARTNER_FORM_INPUT_CLASS,
  memberToPartnerForm,
  memberToPartnerApplicationForm,
  createPartnerFieldChangeHandler,
} from "@/features/partners/partnerFormFields";

describe("PARTNER_FORM_INPUT_CLASS", () => {
  it("equals form-input", () => {
    expect(PARTNER_FORM_INPUT_CLASS).toBe("form-input");
  });
});

describe("memberToPartnerForm", () => {
  it("maps common fields from a member record", () => {
    const form = memberToPartnerForm({
      organizationName: "Acme Corp",
      username: "acme",
      title: "CEO",
      firstName: "Ada",
      lastName: "Lovelace",
      contactEmail: "ada@acme.com",
      contactPhoneNumber: "555-0100",
      organizationEmail: "hello@acme.com",
      organizationPhoneNumber: "555-0200",
      website: "https://acme.com",
      facebook: "acme",
      twitter: "@acme",
      linkedin: "acme-corp",
      address: "123 Main St",
      country: "Canada",
      province: "AB",
      city: "Calgary",
      postalCode: "T2P 1J9",
      aboutUs: "Fintech partner",
    });

    expect(form).toMatchObject({
      organizationName: "Acme Corp",
      username: "acme",
      password: "",
      title: "CEO",
      firstName: "Ada",
      lastName: "Lovelace",
      contactEmail: "ada@acme.com",
      contactPhoneNumber: "555-0100",
      organizationEmail: "hello@acme.com",
      organizationPhoneNumber: "555-0200",
      website: "https://acme.com",
      facebook: "acme",
      twitter: "@acme",
      linkedin: "acme-corp",
      address: "123 Main St",
      country: "Canada",
      province: "AB",
      city: "Calgary",
      postalCode: "T2P 1J9",
      aboutUs: "Fintech partner",
      logo: null,
    });
  });

  it("defaults missing fields to empty strings and null logo", () => {
    expect(memberToPartnerForm()).toMatchObject({
      organizationName: "",
      username: "",
      password: "",
      logo: null,
    });
  });
});

describe("memberToPartnerApplicationForm", () => {
  it("defaults approvalStatus to pending", () => {
    const form = memberToPartnerApplicationForm({
      organizationName: "Acme Corp",
      firstName: "Ada",
    });
    expect(form.approvalStatus).toBe("pending");
    expect(form.approvedAt).toBeNull();
    expect(form.organizationName).toBe("Acme Corp");
    expect(form.firstName).toBe("Ada");
    expect(form).not.toHaveProperty("password");
    expect(form).not.toHaveProperty("logo");
  });

  it("preserves approvalStatus when provided", () => {
    const form = memberToPartnerApplicationForm({
      approvalStatus: "accepted",
      approvedAt: "2026-01-01T00:00:00Z",
    });
    expect(form.approvalStatus).toBe("accepted");
    expect(form.approvedAt).toBe("2026-01-01T00:00:00Z");
  });
});

describe("createPartnerFieldChangeHandler", () => {
  it("updates values for the given field", () => {
    const setValues = vi.fn((updater) => updater({ name: "old" }));
    const handler = createPartnerFieldChangeHandler(setValues);

    handler("name", "new");

    expect(setValues).toHaveBeenCalledTimes(1);
    expect(setValues.mock.results[0].value).toEqual({ name: "new" });
  });

  it("clears the matching error when setErrors is provided", () => {
    const setValues = vi.fn((updater) => updater({ email: "" }));
    const setErrors = vi.fn((updater) =>
      updater({ email: "Required", name: "Required" }),
    );
    const handler = createPartnerFieldChangeHandler(setValues, setErrors);

    handler("email", "a@b.com");

    expect(setErrors).toHaveBeenCalledTimes(1);
    expect(setErrors.mock.results[0].value).toEqual({
      email: null,
      name: "Required",
    });
  });

  it("leaves errors unchanged when the field has no error", () => {
    const prevErrors = { name: "Required" };
    const setValues = vi.fn((updater) => updater({ email: "" }));
    const setErrors = vi.fn((updater) => updater(prevErrors));
    const handler = createPartnerFieldChangeHandler(setValues, setErrors);

    handler("email", "a@b.com");

    expect(setErrors.mock.results[0].value).toBe(prevErrors);
  });
});
