import { describe, it, expect } from "vitest";
import {
  isRegistrationOpen,
  REGISTRATION_CLOSED_MESSAGE,
} from "./eventRegistration";

describe("isRegistrationOpen", () => {
  it("treats missing and true as open", () => {
    expect(isRegistrationOpen({})).toBe(true);
    expect(isRegistrationOpen({ registrationOpen: true })).toBe(true);
  });

  it("treats an explicit false as closed", () => {
    expect(isRegistrationOpen({ registrationOpen: false })).toBe(false);
    expect(REGISTRATION_CLOSED_MESSAGE).toBe("Registration is closed");
  });
});
