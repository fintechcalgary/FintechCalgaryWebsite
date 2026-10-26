import { describe, it, expect } from "vitest";
import {
  ADMIN_TITLE_CLASS,
  FORM_LABEL_CLASS,
  FORM_INPUT_CLASS,
  FORM_INPUT_AUTO_CLASS,
  LINK_CLASS,
  LINK_UNDERLINE_CLASS,
  INLINE_SPINNER_CLASS,
  ICON_BUTTON_VARIANTS,
  EMPTY_STATE_VARIANTS,
} from "@/lib/uiTokens";

describe("ADMIN_TITLE_CLASS", () => {
  it("equals fc-title-accent", () => {
    expect(ADMIN_TITLE_CLASS).toBe("fc-title-accent");
  });
});

describe("form and link class tokens", () => {
  it("exports expected class strings", () => {
    expect(FORM_LABEL_CLASS).toBe("fc-form-label");
    expect(FORM_INPUT_CLASS).toBe("form-input");
    expect(FORM_INPUT_AUTO_CLASS).toBe("form-input form-input-auto");
    expect(LINK_CLASS).toBe("fc-link");
    expect(LINK_UNDERLINE_CLASS).toBe("fc-link-underline");
    expect(INLINE_SPINNER_CLASS).toBe("fc-spinner-inline");
  });
});

describe("ICON_BUTTON_VARIANTS", () => {
  it("includes edit, danger, ghost, soft, and soft-danger", () => {
    expect(ICON_BUTTON_VARIANTS).toEqual(
      expect.arrayContaining([
        "edit",
        "danger",
        "ghost",
        "soft",
        "soft-danger",
      ]),
    );
  });
});

describe("EMPTY_STATE_VARIANTS", () => {
  it("includes admin and public", () => {
    expect(EMPTY_STATE_VARIANTS).toEqual(
      expect.arrayContaining(["admin", "public"]),
    );
  });
});
