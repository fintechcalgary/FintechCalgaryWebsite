/**
 * Shared UI token names for tests and consistent className strings.
 * Source of truth: uiClassNames.js and components in @/components/ui.
 */
import {
  adminPanel,
  alertError,
  alertSuccess,
  alertWarning,
  body,
  bodyLg,
  btnChip,
  btnDashboardCancel,
  btnDangerSoft,
  btnGradientPrimary,
  btnMarketingPrimary,
  btnMarketingSecondary,
  btnMarketingSoft,
  btnReadMoreSubtle,
  btnSoftChip,
  btnSuccessSoft,
  fileInput,
  formLabel,
  glassCard,
  iconGlyph,
  iconTile,
  insetCard,
  lede,
  linkAccent,
  linkUnderline,
  modalAside,
  modalBody,
  modalCallout,
  modalFileButton,
  modalFooter,
  modalHeader,
  modalIconClose,
  modalPanel,
  modalPanelBleed,
  modalSectionLabel,
  modalTitle,
  muted,
  spinnerInline,
  title,
  titleAccent,
  titleLg,
  topicChip,
} from "@/lib/uiClassNames";

/** Prefer plain `h1`–`h4` / `p` + `src/styles/typography.css`; tokens for non-semantic wrappers. */
export const ADMIN_TITLE_CLASS = titleAccent;
export const TITLE_CLASS = title;
export const TITLE_LG_CLASS = titleLg;
export const FORM_LABEL_CLASS = formLabel;
export const FORM_INPUT_CLASS = "fc-form-input";
export const FORM_INPUT_AUTO_CLASS = "fc-form-input fc-form-input-auto";
export const LINK_CLASS = linkAccent;
export const LINK_UNDERLINE_CLASS = linkUnderline;
export const INLINE_SPINNER_CLASS = spinnerInline;

export const LEDE_CLASS = lede;
export const BODY_CLASS = body;
export const BODY_LG_CLASS = bodyLg;
export const MUTED_CLASS = muted;
export const GLASS_CARD_CLASS = glassCard;
export const ADMIN_PANEL_CLASS = adminPanel;
export const INSET_CARD_CLASS = insetCard;
export const TOPIC_CHIP_CLASS = topicChip;

export const ALERT_ERROR_CLASS = alertError;
export const ALERT_SUCCESS_CLASS = alertSuccess;
export const ALERT_WARNING_CLASS = alertWarning;

export const ICON_GLYPH_CLASS = iconGlyph;
export const ICON_TILE_CLASS = iconTile;
export const FILE_INPUT_CLASS = fileInput;

export const MODAL_PANEL_CLASS = modalPanel;
export const MODAL_PANEL_BLEED_CLASS = modalPanelBleed;
export const MODAL_BODY_CLASS = modalBody;
export const MODAL_HEADER_CLASS = modalHeader;
export const MODAL_TITLE_CLASS = modalTitle;
export const MODAL_FOOTER_CLASS = modalFooter;
export const MODAL_SECTION_LABEL_CLASS = modalSectionLabel;
export const MODAL_ASIDE_CLASS = modalAside;
export const MODAL_CALLOUT_CLASS = modalCallout;
export const MODAL_ICON_CLOSE_CLASS = modalIconClose;
export const MODAL_FILE_BTN_CLASS = modalFileButton;

export const BTN_GRADIENT_PRIMARY_CLASS = btnGradientPrimary;
export const BTN_MARKETING_PRIMARY_CLASS = btnMarketingPrimary;
export const BTN_MARKETING_SECONDARY_CLASS = btnMarketingSecondary;
export const BTN_MARKETING_SOFT_CLASS = btnMarketingSoft;
export const BTN_DASHBOARD_CANCEL_CLASS = btnDashboardCancel;
export const BTN_SOFT_CHIP_CLASS = btnSoftChip;
export const BTN_CHIP_CLASS = btnChip;
export const BTN_SUCCESS_SOFT_CLASS = btnSuccessSoft;
export const BTN_DANGER_SOFT_CLASS = btnDangerSoft;
export const BTN_READ_MORE_SUBTLE_CLASS = btnReadMoreSubtle;

export const ICON_BUTTON_VARIANTS = [
  "edit",
  "danger",
  "ghost",
  "soft",
  "soft-danger",
];

export const EMPTY_STATE_VARIANTS = ["admin", "public"];
