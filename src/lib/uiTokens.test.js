import { describe, it, expect } from "vitest";
import {
  ADMIN_TITLE_CLASS,
  FORM_LABEL_CLASS,
  FORM_INPUT_CLASS,
  FORM_INPUT_AUTO_CLASS,
  LINK_CLASS,
  LINK_UNDERLINE_CLASS,
  INLINE_SPINNER_CLASS,
  LEDE_CLASS,
  BODY_CLASS,
  ADMIN_PANEL_CLASS,
  ICON_BUTTON_VARIANTS,
  EMPTY_STATE_VARIANTS,
} from "@/lib/uiTokens";
import {
  body,
  formLabel,
  lede,
  linkAccent,
  linkUnderline,
  spinnerInline,
  titleAccent,
  adminPanel,
} from "@/lib/uiClassNames";

describe("ADMIN_TITLE_CLASS", () => {
  it("equals titleAccent token", () => {
    expect(ADMIN_TITLE_CLASS).toBe(titleAccent);
  });
});

describe("form and link class tokens", () => {
  it("exports expected class strings from uiClassNames", () => {
    expect(FORM_LABEL_CLASS).toBe(formLabel);
    expect(FORM_INPUT_CLASS).toBe("fc-form-input");
    expect(FORM_INPUT_AUTO_CLASS).toBe("fc-form-input fc-form-input-auto");
    expect(LINK_CLASS).toBe(linkAccent);
    expect(LINK_UNDERLINE_CLASS).toBe(linkUnderline);
    expect(INLINE_SPINNER_CLASS).toBe(spinnerInline);
    expect(LEDE_CLASS).toBe(lede);
    expect(BODY_CLASS).toBe(body);
    expect(ADMIN_PANEL_CLASS).toBe(adminPanel);
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
