"use client";

import { useId, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import {
  pagination,
  paginationBtn,
  paginationEllipsis,
  paginationJumpGroup,
  paginationLabel,
  paginationNum,
  paginationNumActive,
  paginationNums,
  paginationPageInput,
  paginationSizeGroup,
  paginationSizeSelect,
  paginationZone,
  paginationZoneCenter,
  paginationZoneEnd,
  paginationZoneStart,
} from "@/lib/uiClassNames";

function buildPageItems(page, totalPages) {
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const candidates = new Set([
    1,
    2,
    3,
    totalPages - 2,
    totalPages - 1,
    totalPages,
    page - 1,
    page,
    page + 1,
  ]);

  const sorted = [...candidates]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) items.push("…");
    items.push(sorted[i]);
  }
  return items;
}

const DEFAULT_PAGE_SIZES = [12, 24, 48];

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageSizeChange,
  pageSizeLabel = "Rows per page",
  className = "",
  disabled = false,
}) {
  const jumpId = useId();
  const sizeId = useId();
  const [jumpDraft, setJumpDraft] = useState("");
  const [jumpFocused, setJumpFocused] = useState(false);

  const hasPageSize = Boolean(onPageSizeChange);
  if ((!totalPages || totalPages < 1) && !hasPageSize) return null;
  if (totalPages <= 1 && !hasPageSize) return null;

  const safeTotalPages = Math.max(1, totalPages || 1);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const pageItems = buildPageItems(safePage, safeTotalPages);
  const jumpDisplay = jumpFocused ? jumpDraft : String(safePage);

  const goTo = (next) => {
    const clamped = Math.min(Math.max(1, next), safeTotalPages);
    if (clamped !== safePage) onPageChange(clamped);
  };

  const commitJump = () => {
    const parsed = parseInt(jumpDraft, 10);
    if (Number.isNaN(parsed) || jumpDraft === "") return;
    goTo(parsed);
  };

  return (
    <div className={className}>
      <nav className={pagination} aria-label="Pagination">
        <div className={`${paginationZone} ${paginationZoneStart}`.trim()}>
          <div className={paginationJumpGroup}>
            <span className={paginationLabel}>Showing page</span>
            <label htmlFor={jumpId} className="sr-only">
              Current page
            </label>
            <input
              id={jumpId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={jumpDisplay}
              disabled={disabled}
              onFocus={() => {
                setJumpDraft(String(safePage));
                setJumpFocused(true);
              }}
              onChange={(e) =>
                setJumpDraft(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitJump();
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => {
                setJumpFocused(false);
                commitJump();
              }}
              className={paginationPageInput}
              aria-label={`Page number, 1 to ${safeTotalPages}`}
            />
            <span className={paginationLabel}>of {safeTotalPages}</span>
          </div>
        </div>

        <div className={`${paginationZone} ${paginationZoneCenter}`.trim()}>
          <button
            type="button"
            disabled={disabled || safePage <= 1}
            onClick={() => goTo(1)}
            className={paginationBtn}
            aria-label="First page"
          >
            <FiChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={disabled || safePage <= 1}
            onClick={() => goTo(safePage - 1)}
            className={paginationBtn}
            aria-label="Previous page"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>

          <div className={paginationNums}>
            {pageItems.map((item, index) =>
              item === "…" ? (
                <span key={`ellipsis-${index}`} className={paginationEllipsis}>
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  disabled={disabled}
                  onClick={() => goTo(item)}
                  className={`${paginationNum} ${item === safePage && paginationNumActive}`.trim()}
                  aria-label={`Page ${item}`}
                  aria-current={item === safePage ? "page" : undefined}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            disabled={disabled || safePage >= safeTotalPages}
            onClick={() => goTo(safePage + 1)}
            className={paginationBtn}
            aria-label="Next page"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={disabled || safePage >= safeTotalPages}
            onClick={() => goTo(safeTotalPages)}
            className={paginationBtn}
            aria-label="Last page"
          >
            <FiChevronsRight className="h-4 w-4" />
          </button>
        </div>

        {hasPageSize ? (
          <div className={`${paginationZone} ${paginationZoneEnd}`.trim()}>
            <div className={paginationSizeGroup}>
              <label htmlFor={sizeId} className={paginationLabel}>
                {pageSizeLabel}
              </label>
              <select
                id={sizeId}
                value={pageSize}
                disabled={disabled}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={paginationSizeSelect}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </nav>
    </div>
  );
}
