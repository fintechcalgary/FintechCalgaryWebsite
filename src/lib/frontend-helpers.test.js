import { describe, it, expect } from "vitest";
import {
  validateFile,
  validateRequiredFields,
  validateEmail,
  validateMinLength,
  validatePassword,
  validateUsername,
} from "@/lib/frontend-helpers";
import { VALIDATION, ERROR_MESSAGES } from "@/lib/constants";

function makeFile({ name = "test.pdf", type = "application/pdf", size = 1024 }) {
  return { name, type, size };
}

describe("validateFile", () => {
  it("returns error when no file is provided", () => {
    expect(validateFile(null)).toEqual({
      valid: false,
      error: "No file selected",
    });
  });

  it("returns valid for matching MIME type", () => {
    const file = makeFile({ type: "image/png", name: "photo.png" });
    const result = validateFile(file, {
      allowedTypes: ["image/png", "image/jpeg"],
      maxSize: 5 * 1024 * 1024,
    });
    expect(result).toEqual({ valid: true, error: null });
  });

  it("returns FILE_TYPE_INVALID when MIME type does not match", () => {
    const file = makeFile({ type: "text/plain", name: "notes.txt" });
    const result = validateFile(file, {
      allowedTypes: ["application/pdf"],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      ERROR_MESSAGES.FILE_TYPE_INVALID(["application/pdf"]),
    );
  });

  it("falls back to extension check when MIME type does not match", () => {
    const file = makeFile({ type: "application/octet-stream", name: "doc.pdf" });
    const result = validateFile(file, {
      allowedTypes: ["application/pdf"],
      allowedExtensions: ["pdf"],
    });
    expect(result).toEqual({ valid: true, error: null });
  });

  it("returns FILE_TYPE_INVALID when extension does not match", () => {
    const file = makeFile({ type: "application/octet-stream", name: "doc.exe" });
    const result = validateFile(file, {
      allowedTypes: ["application/pdf"],
      allowedExtensions: ["pdf"],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe(ERROR_MESSAGES.FILE_TYPE_INVALID(["pdf"]));
  });

  it("returns FILE_SIZE_EXCEEDED when file is too large", () => {
    const file = makeFile({ size: 6 * 1024 * 1024 });
    const result = validateFile(file, {
      allowedTypes: ["application/pdf"],
      maxSize: 5 * 1024 * 1024,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe(ERROR_MESSAGES.FILE_SIZE_EXCEEDED("5.0"));
  });
});

describe("validateRequiredFields", () => {
  it("returns empty object when all fields are present", () => {
    expect(
      validateRequiredFields({ name: "Alice", email: "a@b.com" }, [
        "name",
        "email",
      ]),
    ).toEqual({});
  });

  it("returns errors for missing fields with capitalized names", () => {
    expect(
      validateRequiredFields({ name: "Alice" }, ["name", "email", "phone"]),
    ).toEqual({
      email: ERROR_MESSAGES.REQUIRED_FIELD("Email"),
      phone: ERROR_MESSAGES.REQUIRED_FIELD("Phone"),
    });
  });
});

describe("validateEmail", () => {
  it("returns null for valid email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
  });

  it("returns EMAIL_REQUIRED when empty", () => {
    expect(validateEmail("")).toBe(ERROR_MESSAGES.EMAIL_REQUIRED);
  });

  it("returns EMAIL_INVALID for malformed email", () => {
    expect(validateEmail("bad-email")).toBe(ERROR_MESSAGES.EMAIL_INVALID);
  });
});

describe("validateMinLength", () => {
  it("returns null when value meets minimum", () => {
    expect(validateMinLength("hello", 3, "Name")).toBeNull();
  });

  it("returns null when value is falsy", () => {
    expect(validateMinLength("", 3, "Name")).toBeNull();
  });

  it("returns error when too short", () => {
    expect(validateMinLength("ab", 3, "Name")).toBe(
      "Name must be at least 3 characters long",
    );
  });
});

describe("validatePassword", () => {
  it("returns null for password meeting minimum length", () => {
    expect(validatePassword("secret")).toBeNull();
  });

  it("returns error when password is too short", () => {
    expect(validatePassword("12345")).toBe(
      `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
    );
  });
});

describe("validateUsername", () => {
  it("returns null for username meeting minimum length", () => {
    expect(validateUsername("alice")).toBeNull();
  });

  it("returns error when username is too short", () => {
    expect(validateUsername("ab")).toBe(
      `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters long`,
    );
  });
});
