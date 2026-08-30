import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

import { validators } from "@/lib/api-helpers";
import { VALIDATION, ERROR_MESSAGES } from "@/lib/constants";

describe("validators.email", () => {
  it("returns null for a valid email", () => {
    expect(validators.email("user@example.com")).toBeNull();
  });

  it("returns EMAIL_REQUIRED when empty", () => {
    expect(validators.email("")).toBe(ERROR_MESSAGES.EMAIL_REQUIRED);
    expect(validators.email(null)).toBe(ERROR_MESSAGES.EMAIL_REQUIRED);
    expect(validators.email(undefined)).toBe(ERROR_MESSAGES.EMAIL_REQUIRED);
  });

  it("returns EMAIL_INVALID for malformed addresses", () => {
    expect(validators.email("not-an-email")).toBe(ERROR_MESSAGES.EMAIL_INVALID);
    expect(validators.email("missing@domain")).toBe(ERROR_MESSAGES.EMAIL_INVALID);
    expect(validators.email("@example.com")).toBe(ERROR_MESSAGES.EMAIL_INVALID);
  });
});

describe("validators.required", () => {
  it("returns null when value is truthy", () => {
    expect(validators.required("hello", "Name")).toBeNull();
    expect(validators.required("0", "Count")).toBeNull();
  });

  it("treats falsy values as missing", () => {
    expect(validators.required(0, "Count")).toBe(
      ERROR_MESSAGES.REQUIRED_FIELD("Count"),
    );
    expect(validators.required(false, "Active")).toBe(
      ERROR_MESSAGES.REQUIRED_FIELD("Active"),
    );
  });

  it("returns REQUIRED_FIELD message when value is falsy", () => {
    expect(validators.required("", "Name")).toBe(
      ERROR_MESSAGES.REQUIRED_FIELD("Name"),
    );
    expect(validators.required(null, "Email")).toBe(
      ERROR_MESSAGES.REQUIRED_FIELD("Email"),
    );
  });
});

describe("validators.requiredFields", () => {
  it("returns null when all fields are present", () => {
    expect(
      validators.requiredFields({ name: "Alice", email: "a@b.com" }, [
        "name",
        "email",
      ]),
    ).toBeNull();
  });

  it("returns missing fields message listing absent keys", () => {
    const error = validators.requiredFields({ name: "Alice" }, [
      "name",
      "email",
      "phone",
    ]);
    expect(error).toBe("Missing required fields: email, phone");
  });

  it("treats undefined and null as missing", () => {
    const error = validators.requiredFields(
      { name: "Alice", email: undefined, phone: null },
      ["name", "email", "phone"],
    );
    expect(error).toBe("Missing required fields: email, phone");
  });
});

describe("validators.array", () => {
  it("returns null for arrays and undefined", () => {
    expect(validators.array(["a"], "Tags")).toBeNull();
    expect(validators.array([], "Tags")).toBeNull();
    expect(validators.array(undefined, "Tags")).toBeNull();
  });

  it("returns error when value is not an array", () => {
    expect(validators.array("not-array", "Tags")).toBe("Tags must be an array");
    expect(validators.array({}, "Items")).toBe("Items must be an array");
  });
});

describe("validators.minLength", () => {
  it("returns null when value meets minimum length", () => {
    expect(validators.minLength("hello", 3, "Name")).toBeNull();
  });

  it("returns null when value is falsy", () => {
    expect(validators.minLength("", 3, "Name")).toBeNull();
    expect(validators.minLength(null, 3, "Name")).toBeNull();
  });

  it("returns error when value is too short", () => {
    expect(validators.minLength("ab", 3, "Name")).toBe(
      "Name must be at least 3 characters long",
    );
  });
});

describe("validators.password", () => {
  it("returns null for a password meeting minimum length", () => {
    expect(validators.password("secret123")).toBeNull();
  });

  it("returns required message when empty", () => {
    expect(validators.password("")).toBe("Password is required");
    expect(validators.password(null)).toBe("Password is required");
  });

  it("returns PASSWORD_MIN_LENGTH when too short", () => {
    expect(validators.password("12345")).toBe(ERROR_MESSAGES.PASSWORD_MIN_LENGTH);
    expect(ERROR_MESSAGES.PASSWORD_MIN_LENGTH).toContain(
      String(VALIDATION.PASSWORD_MIN_LENGTH),
    );
  });
});

describe("validators.username", () => {
  it("returns null for a username meeting minimum length", () => {
    expect(validators.username("alice")).toBeNull();
  });

  it("returns REQUIRED_FIELD when empty", () => {
    expect(validators.username("")).toBe(
      ERROR_MESSAGES.REQUIRED_FIELD("Username"),
    );
  });

  it("returns USERNAME_MIN_LENGTH when too short", () => {
    expect(validators.username("ab")).toBe(ERROR_MESSAGES.USERNAME_MIN_LENGTH);
    expect(ERROR_MESSAGES.USERNAME_MIN_LENGTH).toContain(
      String(VALIDATION.USERNAME_MIN_LENGTH),
    );
  });
});

describe("validators.validateRequiredAndEmail", () => {
  it("returns null when all required fields and email are valid", () => {
    expect(
      validators.validateRequiredAndEmail(
        { name: "Alice", email: "alice@example.com" },
        ["name", "email"],
      ),
    ).toBeNull();
  });

  it("returns required fields error before checking email", () => {
    expect(
      validators.validateRequiredAndEmail({ email: "bad" }, ["name", "email"]),
    ).toBe("Missing required fields: name");
  });

  it("returns email error when required email field is invalid", () => {
    expect(
      validators.validateRequiredAndEmail(
        { name: "Alice", email: "not-valid" },
        ["name", "email"],
      ),
    ).toBe(ERROR_MESSAGES.EMAIL_INVALID);
  });

  it("skips email validation when email is not in required fields", () => {
    expect(
      validators.validateRequiredAndEmail(
        { name: "Alice", email: "not-valid" },
        ["name"],
      ),
    ).toBeNull();
  });

  it("supports a custom email field name", () => {
    expect(
      validators.validateRequiredAndEmail(
        { name: "Alice", contactEmail: "bad" },
        ["name", "contactEmail"],
        "contactEmail",
      ),
    ).toBe(ERROR_MESSAGES.EMAIL_INVALID);
  });
});
