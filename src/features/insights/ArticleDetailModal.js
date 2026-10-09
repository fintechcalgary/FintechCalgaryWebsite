"use client";

import { motion } from "framer-motion";
import {
  FiExternalLink,
  FiZap,
  FiTrendingUp,
  FiTarget,
  FiBarChart2,
} from "react-icons/fi";
import ModalRoot from "@/components/ui/Modal/ModalRoot";
import ModalCloseButton from "@/components/ui/Modal/ModalCloseButton";

const ease = [0.16, 1, 0.3, 1];

export default function ArticleDetailModal({ isOpen, onClose, article }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ModalRoot isOpen={isOpen && !!article} onClose={onClose} layout="none">
      {article ? (
        <motion.div
          key="article-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease }}
          role="dialog"
          aria-modal="true"
          aria-label={article.title}
          className="fc-modal-panel fixed inset-4 z-[999999] flex max-h-none flex-col border-gray-700/50 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 md:inset-8 lg:inset-x-16 lg:inset-y-12 xl:inset-x-24"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="fc-modal-header flex-shrink-0 items-start">
            <div className="mr-4 min-w-0 flex-1">
              <div className="fc-muted mb-3 flex items-center gap-2 text-sm">
                <span className="font-medium uppercase">{article.source}</span>
                {(article.date || article.publishedAt) && (
                  <>
                    <span>•</span>
                    <span>{formatDate(article.date || article.publishedAt)}</span>
                  </>
                )}
              </div>
              <h2 className="fc-modal-title leading-tight">{article.title}</h2>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              {article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-gray-700/30 bg-gray-800/50 p-2 text-gray-400 transition-all hover:bg-gray-700/50 hover:text-primary"
                  title="Open original article"
                >
                  <FiExternalLink className="h-5 w-5" />
                </a>
              ) : null}
              <ModalCloseButton onClick={onClose} label="Close article modal" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {article.summary ? (
              <div className="space-y-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/10">
                    <FiZap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Summary</h3>
                    <p className="fc-muted">Comprehensive insights and analysis</p>
                  </div>
                </div>

                <div className="fc-body-lg space-y-4">
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
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-800/50 pt-6 md:grid-cols-3">
                  {[
                    {
                      icon: FiTrendingUp,
                      label: "Market Impact",
                      sub: "Industry implications",
                      color:
                        "from-primary/10 to-purple-500/10 border-primary/20",
                      iconColor: "text-primary",
                    },
                    {
                      icon: FiTarget,
                      label: "Strategic View",
                      sub: "Key takeaways",
                      color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
                      iconColor: "text-blue-400",
                    },
                    {
                      icon: FiBarChart2,
                      label: "Trends",
                      sub: "Related movements",
                      color:
                        "from-green-500/10 to-emerald-500/10 border-green-500/20",
                      iconColor: "text-green-400",
                    },
                  ].map(({ icon: Icon, label, sub, color, iconColor }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-3 rounded-xl border bg-gradient-to-br p-4 ${color}`}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 ${iconColor}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="fc-muted text-xs">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/20">
                  <FiZap className="h-8 w-8 text-gray-400" />
                </div>
                <p className="fc-body mb-2">No AI summary available yet</p>
                <p className="fc-muted">
                  Summaries are generated during the weekly Friday refresh.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-800/50 p-6">
            <p className="fc-muted">
              AI analysis powered by Groq · Not financial advice
            </p>
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fc-btn-gradient-primary px-4 py-2"
              >
                <FiExternalLink className="h-4 w-4" />
                Read Full Article
              </a>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </ModalRoot>
  );
}
