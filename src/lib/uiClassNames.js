/**
 * Tailwind class strings for the Fintech Calgary design system.
 * Prefer wrapper components in @/components/ui when available.
 */

/* ——— Modals ——— */
export const modalBackdrop =
  "fixed inset-0 z-[999998] bg-black/70 backdrop-blur-xl";

export const modalContainer =
  "fixed inset-0 z-[999999] flex items-center justify-center p-3 pointer-events-none sm:p-4 md:p-6";

export const modalPanel =
  "w-full overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/95 shadow-2xl backdrop-blur-xl pointer-events-auto";

export const modalPanelBleed =
  "fixed z-[999999] flex min-h-0 flex-col inset-3 max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:inset-4 sm:max-h-[calc(100dvh-2rem)] sm:w-auto sm:max-w-none md:inset-6 lg:inset-x-12 lg:inset-y-8 xl:inset-x-20";

export const modalSectionLabel =
  "mb-3 text-xs font-medium uppercase tracking-wider text-white/45";

export const modalAside =
  "min-w-0 flex-shrink-0 space-y-6 border-t border-gray-800/50 px-4 py-4 sm:px-5 sm:py-5 lg:w-64 lg:max-w-[18rem] lg:border-l lg:border-t-0 xl:w-72";

export const modalCallout =
  "rounded-xl border border-white/10 bg-white/[0.03] p-4";

export const modalHeader =
  "sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-800/50 bg-gray-900/95 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5";

export const modalTitle = "text-lg font-bold text-white sm:text-xl";

export const modalBody = "p-4 sm:p-6";

export const modalFooter =
  "sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-gray-800/50 bg-gray-900/95 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-5";

export const modalIconClose =
  "rounded-xl p-2 text-gray-400 transition-all duration-200 hover:bg-gray-800/50 hover:text-white hover:scale-105";

export const modalFileButton =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/50 px-3 py-2 text-white transition-all duration-200 hover:border-primary hover:bg-gray-700";

/* ——— Buttons ——— */
export const btnDashboardCancel =
  "flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gray-200 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]";

export const btnGradientPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-gradient-to-r from-violet-500 via-primary to-purple-600 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:translate-y-0 active:scale-[0.98]";

export const btnMarketingPrimary = "btn-marketing-primary";

export const btnMarketingSecondary = "btn-marketing-secondary";

export const btnMarketingSoft = "btn-marketing-soft";

export const btnSoftChip =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/30 hover:border-primary/50 active:scale-[0.98]";

export const btnChip =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:border-primary/50 hover:bg-primary/25 active:scale-[0.98]";

export const btnSuccessSoft =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300 transition-all duration-200 hover:bg-emerald-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnDangerSoft =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-all duration-200 hover:bg-red-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnReadMoreSubtle =
  "flex cursor-pointer items-center gap-2 self-start rounded-xl border border-primary/35 bg-gradient-to-r from-primary/15 to-purple-500/15 px-3 py-1.5 text-sm font-medium text-primary backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-primary/55 hover:from-primary/25 hover:to-purple-500/25 hover:shadow-lg hover:shadow-primary/15";

/* ——— Surfaces ——— */
export const glassCard =
  "rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm transition-all duration-500 hover:border-primary/30";

export const adminPanel =
  "rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-xl";

export const insetCard =
  "rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-primary/30 hover:bg-white/[0.04]";

export const topicChip =
  "cursor-pointer whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-gray-200 transition-colors hover:border-primary/40 hover:text-white";

/* ——— Alerts ——— */
export const alertError =
  "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300";

export const alertSuccess =
  "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300";

export const alertWarning =
  "rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200";

/* ——— Back link ——— */
export const backLink =
  "mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950";

export const backLinkIcon =
  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5";

/* ——— Typography ——— */
export const lede =
  "text-base font-light leading-relaxed tracking-wide text-white/55 sm:text-lg md:text-xl md:leading-[1.7]";

export const body =
  "text-sm font-normal leading-[1.7] tracking-[0.015em] text-white/65";

export const bodyLg =
  "text-base font-normal leading-[1.75] tracking-[0.015em] text-white/70 sm:text-lg";

export const muted =
  "text-sm font-normal leading-relaxed tracking-wide text-white/45";

export const linkAccent =
  "font-medium tracking-wide text-primary transition-colors duration-300 hover:text-violet-300";

export const linkUnderline =
  "font-medium tracking-wide text-primary underline decoration-primary/30 underline-offset-[3px] transition-colors duration-300 hover:text-violet-300 hover:decoration-violet-300/50";

export const formLabel = "mb-1 block text-sm font-medium text-gray-300";

export const title =
  "font-display font-semibold tracking-tight text-white";

export const titleLg =
  "font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl";

export const titleAccent =
  "font-display font-semibold tracking-tight bg-gradient-to-br from-white via-violet-200 to-primary bg-clip-text text-transparent";

/* ——— Icons & inputs ——— */
export const iconGlyph =
  "fc-icon inline-flex shrink-0 items-center justify-center leading-none text-violet-400 [&_svg]:block";

export const iconTile =
  "fc-icon-tile inline-flex shrink-0 items-center justify-center leading-none text-violet-400 [&_svg]:block";

export const spinnerInline =
  "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent";

export const fileInput =
  "w-full cursor-pointer text-sm text-gray-400 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-primary/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary file:transition-colors hover:file:bg-primary/30";

export const statBand =
  "relative overflow-hidden rounded-none md:rounded-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent";

/* ——— Pagination ——— */
export const pagination =
  "grid w-full grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-gray-900/60 px-3 py-3 shadow-lg shadow-black/25 backdrop-blur-xl sm:grid-cols-3 sm:items-center sm:gap-2 sm:px-4 sm:py-2.5";

export const paginationZone = "flex items-center gap-2";

export const paginationZoneStart =
  "min-w-0 justify-center sm:justify-self-start sm:justify-start";

export const paginationJumpGroup =
  "inline-flex max-w-full shrink-0 flex-nowrap items-center gap-1.5";

export const paginationSizeGroup = paginationJumpGroup;

export const paginationZoneCenter =
  "flex-nowrap justify-center justify-self-center gap-0.5";

export const paginationZoneEnd =
  "min-w-0 justify-center sm:justify-end sm:justify-self-end";

export const paginationLabel = "whitespace-nowrap text-sm text-white/45";

export const paginationPageInput =
  "!m-0 !h-9 !w-11 !min-w-0 !max-w-[2.75rem] shrink-0 !rounded-lg !border !border-white/10 !bg-white/[0.04] !px-1 !py-0 text-center text-sm font-semibold tabular-nums text-white !shadow-none transition-all duration-200 focus:!border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/20";

export const paginationSizeSelect =
  "!m-0 !h-9 !w-[3.25rem] !max-w-[3.25rem] shrink-0 cursor-pointer !rounded-lg !border !border-white/10 !bg-white/[0.04] !px-1.5 !py-0 !pr-6 text-center text-sm font-semibold tabular-nums text-white !shadow-none transition-all duration-200 focus:!border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[length:1em_1em] bg-[position:right_0.35rem_center]";

export const paginationBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/45 transition-all duration-200 hover:bg-white/[0.07] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-25";

export const paginationNums = "flex items-center gap-0.5 px-1";

export const paginationNum =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium tabular-nums text-white/55 transition-all duration-200 hover:bg-white/[0.06] hover:text-white active:scale-95";

export const paginationNumActive =
  "bg-white/[0.1] text-white ring-1 ring-white/15";

export const paginationEllipsis = "select-none px-1 text-sm text-white/30";
