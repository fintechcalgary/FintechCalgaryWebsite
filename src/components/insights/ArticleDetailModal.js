"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiExternalLink,
  FiZap,
  FiTrendingUp,
  FiTarget,
  FiBarChart2,
} from "react-icons/fi";

export default function ArticleDetailModal({ isOpen, onClose, article }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && article && (
        <>
          {/* Backdrop */}
          <motion.div
            key="article-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="article-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={article.title}
            className="fixed inset-4 md:inset-8 lg:inset-x-16 lg:inset-y-12 xl:inset-x-24 z-[60] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-2xl border border-gray-700/50 flex flex-col overflow-hidden shadow-2xl"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-800/50 flex-shrink-0">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                  <span className="font-medium uppercase">{article.source}</span>
                  {(article.date || article.publishedAt) && (
                    <>
                      <span>•</span>
                      <span>{formatDate(article.date || article.publishedAt)}</span>
                    </>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {article.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/30 text-gray-400 hover:text-primary hover:bg-gray-700/50 transition-all"
                    title="Open original article"
                  >
                    <FiExternalLink className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/30 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Close"
                  aria-label="Close article modal"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {article.summary ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-primary/30">
                      <FiZap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">AI Summary</h3>
                      <p className="text-sm text-gray-400">Comprehensive insights and analysis</p>
                    </div>
                  </div>

                  <div className="text-gray-300 leading-relaxed space-y-4">
                    {article.summary.split("\n\n").map((paragraph, index) => {
                      const p = paragraph.trim();
                      if (!p) return null;
                      // Short lines with no sentence-ending punctuation → treat as heading
                      const isHeading =
                        p.length < 50 &&
                        !p.endsWith(".") &&
                        !p.endsWith("!") &&
                        !p.endsWith("?");
                      return isHeading ? (
                        <h4 key={index} className="text-lg font-semibold text-white mt-6 mb-2">
                          {p}
                        </h4>
                      ) : (
                        <p key={index} className="text-gray-200 leading-relaxed">
                          {p}
                        </p>
                      );
                    })}
                  </div>

                  {/* Quick tags */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-800/50">
                    {[
                      { icon: FiTrendingUp, label: "Market Impact", sub: "Industry implications", color: "from-primary/10 to-purple-500/10 border-primary/20", iconColor: "text-primary" },
                      { icon: FiTarget, label: "Strategic View", sub: "Key takeaways", color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20", iconColor: "text-blue-400" },
                      { icon: FiBarChart2, label: "Trends", sub: "Related movements", color: "from-green-500/10 to-emerald-500/10 border-green-500/20", iconColor: "text-green-400" },
                    ].map(({ icon: Icon, label, sub, color, iconColor }) => (
                      <div key={label} className={`flex items-center gap-3 p-4 bg-gradient-to-br ${color} rounded-xl border`}>
                        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
                        <div>
                          <p className="text-sm font-medium text-white">{label}</p>
                          <p className="text-xs text-gray-400">{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mb-4">
                    <FiZap className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 mb-2">No AI summary available yet</p>
                  <p className="text-sm text-gray-500">
                    Summaries are generated during the weekly Friday refresh.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-800/50 flex-shrink-0">
              <p className="text-sm text-gray-500">AI analysis powered by Gemini · Not financial advice</p>
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:shadow-xl hover:shadow-primary/30 transition-all text-sm font-medium"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Read Full Article
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
