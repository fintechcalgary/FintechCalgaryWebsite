"use client";
import {
  BTN_GRADIENT_PRIMARY_CLASS,
  ICON_GLYPH_CLASS,
  MODAL_BODY_CLASS,
  MODAL_CALLOUT_CLASS,
  MODAL_FOOTER_CLASS,
  MODAL_ICON_CLOSE_CLASS,
} from "@/lib/uiTokens";

import {
  FiExternalLink,
  FiZap,
  FiTrendingUp,
  FiTarget,
  FiBarChart2,
} from "react-icons/fi";
import BleedModal, { BleedModalHeader } from "@/components/ui/Modal/BleedModal";
import { formatDateLong } from "@/lib/dates";
import { extractReadableSource } from "@/lib/article-display";

export default function ArticleDetailModal({ isOpen, onClose, article }) {
  const open = Boolean(isOpen && article);

  return (
    <BleedModal
      isOpen={open}
      onClose={onClose}
      ariaLabel={article?.title || "Article detail"}
      header={
        article ? (
          <BleedModalHeader
            onClose={onClose}
            closeLabel="Close article modal"
            actions={
              article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${MODAL_ICON_CLOSE_CLASS} border border-gray-700/40`.trim()}
                  title="Open original article"
                >
                  <FiExternalLink className="h-5 w-5" />
                </a>
              ) : null
            }
            title={
              <>
                <p className="text-muted mb-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium uppercase tracking-wide">
                    {extractReadableSource(article)}
                  </span>
                  {(article.date || article.publishedAt) && (
                    <>
                      <span aria-hidden>•</span>
                      <span>
                        {formatDateLong(article.date || article.publishedAt)}
                      </span>
                    </>
                  )}
                </p>
                <h2 className="modal-title leading-tight">{article.title}</h2>
              </>
            }
          />
        ) : null
      }
      footer={
        article ? (
          <div className={`${MODAL_FOOTER_CLASS} flex-shrink-0 !flex-row !items-center !justify-between`.trim()}>
            <p className="text-muted text-sm">
              AI analysis powered by Groq · Not financial advice
            </p>
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_GRADIENT_PRIMARY_CLASS} px-4 py-2`.trim()}
              >
                <FiExternalLink className="h-4 w-4" />
                Read Full Article
              </a>
            ) : null}
          </div>
        ) : null
      }
    >
      {article ? (
        <div className={MODAL_BODY_CLASS}>
          {article.summary ? (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <span className={ICON_GLYPH_CLASS}>
                  <FiZap className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="modal-title !text-xl">AI Summary</h2>
                  <p className="text-muted">Comprehensive insights and analysis</p>
                </div>
              </div>

              <p className="text-body-lg space-y-4">
                {article.summary.split("\n\n").map((paragraph, index) => {
                  const p = paragraph.trim();
                  if (!p) return null;
                  const isHeading =
                    p.length < 50 &&
                    !p.endsWith(".") &&
                    !p.endsWith("!") &&
                    !p.endsWith("?");
                  return isHeading ? (
                    <h4
                      key={index}
                      className="mb-2 mt-6 text-lg font-semibold text-white"
                    >
                      {p}
                    </h4>
                  ) : (
                    <p key={index}>{p}</p>
                  );
                })}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-800/50 pt-6 md:grid-cols-3">
                {[
                  {
                    icon: FiTrendingUp,
                    label: "Market Impact",
                    sub: "Industry implications",
                  },
                  {
                    icon: FiTarget,
                    label: "Strategic View",
                    sub: "Key takeaways",
                  },
                  {
                    icon: FiBarChart2,
                    label: "Trends",
                    sub: "Related movements",
                  },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className={`${MODAL_CALLOUT_CLASS} flex items-center gap-3`.trim()}
                  >
                    <span className={ICON_GLYPH_CLASS}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-muted text-xs">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className={`${ICON_GLYPH_CLASS} mb-4`.trim()}>
                <FiZap className="h-8 w-8" />
              </span>
              <p className="mb-2">No AI summary available yet</p>
              <p className="text-muted">
                Summaries are generated during the weekly Friday refresh.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </BleedModal>
  );
}
