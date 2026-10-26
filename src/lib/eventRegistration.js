export const REGISTRATION_CLOSED_MESSAGE = "Registration is closed";

/** Registration stays open unless it is explicitly closed. */
export function isRegistrationOpen(event) {
  return event?.registrationOpen !== false;
}
