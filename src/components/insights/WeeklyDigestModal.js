"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiExternalLink,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiZap,
  FiCalendar,
  FiGlobe,
  FiMessageCircle,
} from "react-icons/fi";
import { useChatBot } from "@/contexts/ChatBotContext";

function getIssueNumber(weekStart) {
  if (!weekStart) return null;
  const origin = new Date("2024-09-02"); // FinTech Calgary season start
  const start = new Date(weekStart);
  const weeks = Math.max(1, Math.round((start - origin) / (7 * 24 * 60 * 60 * 1000)) + 1);
  return weeks;
}

function formatWeekRange(weekStart, weekEnd) {
  if (!weekStart) return null;
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return weekEnd
    ? `${fmt(weekStart)} – ${fmt(weekEnd)}`
    : fmt(weekStart);
}

function SentimentBar({ label, value, total, colorClass, bgClass }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={colorClass}>{label}</span>
        <span className="text-gray-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${bgClass}`}
        />
      </div>
    </div>
  );
}

export default function WeeklyDigestModal({ isOpen, onClose, articles = [], weekStart, weekEnd, stats = null }) {
  const scrollRef = useRef(null);
  const { setIsOpen: setChatOpen } = useChatBot();

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const issueNumber = getIssueNumber(weekStart);
  const weekRange = formatWeekRange(weekStart, weekEnd);

  // Derive stats: prefer MongoDB-computed stats (more accurate); fall back to
  // client-side calculation from article categories/sentiment fields.
  const calculatedStats = useMemo(() => {
    const sentiment = { positive: 0, negative: 0, neutral: 0, total: 0 };
    const topicCounts = {};

    articles.forEach((article) => {
      const s = (article.sentiment || "").toLowerCase();
      if (s === "positive") sentiment.positive++;
      else if (s === "negative") sentiment.negative++;
      else sentiment.neutral++;
      sentiment.total++;

      if (Array.isArray(article.categories)) {
        article.categories.forEach((cat) => {
          if (cat) topicCounts[cat] = (topicCounts[cat] || 0) + 1;
        });
      }
    });

    const topics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return { sentiment, topics };
  }, [articles]);

  // MongoDB stats take priority; client-calculated as fallback
  const sentiment = stats?.sentiment || calculatedStats.sentiment;
  const topics = (stats?.topics?.length ? stats.topics : calculatedStats.topics).slice(0, 6);

  const sources = articles.length > 0
    ? new Set(articles.map((a) => a.source).filter(Boolean)).size
    : 0;

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleOpenChat = () => {
    onClose();
    setTimeout(() => setChatOpen(true), 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Weekly FinTech Digest"
            className="fixed inset-4 md:inset-8 lg:inset-x-16 lg:inset-y-8 xl:inset-x-28 z-[60] flex flex-col rounded-2xl overflow-hidden border border-primary/30 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f0f1a 0%, #13111f 50%, #0d0d18 100%)",
              boxShadow: "0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Close button — direct child of modal, no sub-stacking-context interference */}
            <button
              type="button"
              aria-label="Close weekly digest"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800/60 border border-gray-700/40 text-gray-400 hover:text-white hover:bg-gray-700/60 transition-all cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* ── Header ── */}
            <div className="relative flex-shrink-0 px-6 pt-6 pb-5 border-b border-gray-800/60"
              style={{ background: "linear-gradient(to bottom, rgba(139,92,246,0.08), transparent)" }}
            >
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-primary/10 blur-3xl pointer-events-none" />

              <div className="relative z-[1]">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                    <FiZap className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                      FinTech Calgary
                    </span>
                  </div>
                  {issueNumber && (
                    <span className="text-xs text-gray-500 font-mono">Issue #{issueNumber}</span>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
                  Weekly{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-400">
                    FinTech Digest
                  </span>
                </h2>

                {weekRange && (
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <FiCalendar className="w-3.5 h-3.5" />
                    {weekRange}
                  </p>
                )}

                {/* Quick stats strip */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {articles.length} curated stories
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiGlobe className="w-3 h-3" />
                    {sources} sources
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiZap className="w-3 h-3" />
                    AI-summarized
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Refreshed every Friday
                  </span>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="flex flex-col lg:flex-row gap-0 h-full">

                {/* Left — article list */}
                <div className="flex-1 px-6 py-5 space-y-3 min-w-0">
                  {articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <FiZap className="w-10 h-10 text-gray-600 mb-3" />
                      <p className="text-gray-400">No digest available yet.</p>
                      <p className="text-sm text-gray-500 mt-1">Check back after the next Friday refresh.</p>
                    </div>
                  ) : (
                    articles.map((article, index) => (
                      <DigestArticleRow key={article._id || article.url || index} article={article} rank={index + 1} formatDate={formatDate} />
                    ))
                  )}
                </div>

                {/* Right — sidebar */}
                <div className="lg:w-64 xl:w-72 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-800/60 px-5 py-5 space-y-6">

                  {/* Sentiment */}
                  {sentiment && sentiment.total > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Market Sentiment
                      </h4>
                      <div className="space-y-3">
                        <SentimentBar
                          label="Positive"
                          value={sentiment.positive}
                          total={sentiment.total}
                          colorClass="text-green-400"
                          bgClass="bg-gradient-to-r from-green-500 to-emerald-400"
                        />
                        <SentimentBar
                          label="Neutral"
                          value={sentiment.neutral}
                          total={sentiment.total}
                          colorClass="text-gray-400"
                          bgClass="bg-gray-500"
                        />
                        <SentimentBar
                          label="Negative"
                          value={sentiment.negative}
                          total={sentiment.total}
                          colorClass="text-red-400"
                          bgClass="bg-gradient-to-r from-red-500 to-rose-400"
                        />
                      </div>
                      <div className="mt-3 p-2.5 rounded-lg bg-gray-800/40 border border-gray-700/30 text-center">
                        <span className="text-xs text-gray-400">Overall mood: </span>
                        <span className={`text-xs font-semibold ${
                          sentiment.positive > sentiment.negative ? "text-green-400" :
                          sentiment.negative > sentiment.positive ? "text-red-400" :
                          "text-gray-400"
                        }`}>
                          {sentiment.positive > sentiment.negative ? "Bullish" :
                           sentiment.negative > sentiment.positive ? "Cautious" : "Mixed"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Trending topics */}
                  {topics.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        This Week's Topics
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {topics.map(({ topic, count }, i) => (
                          <span
                            key={topic}
                            className="px-2.5 py-1 rounded-md text-xs border font-medium capitalize"
                            style={{
                              background: `rgba(139,92,246,${0.08 + (topics.length - i) / topics.length * 0.12})`,
                              borderColor: `rgba(139,92,246,${0.2 + (topics.length - i) / topics.length * 0.2})`,
                              color: i < 3 ? "#a78bfa" : "#9ca3af",
                            }}
                          >
                            {topic}
                            <span className="ml-1 opacity-60 text-[10px]">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ask AI CTA */}
                  <div className="rounded-xl p-4 border border-primary/20 bg-gradient-to-br from-primary/10 to-purple-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FiMessageCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-white">Ask the Digest</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                      Chat with AI about this week's stories — ask questions, get deeper analysis.
                    </p>
                    <button
                      onClick={handleOpenChat}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Open AI Chat →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DigestArticleRow({ article, rank, formatDate }) {
  const rankColor =
    rank === 1 ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" :
    rank === 2 ? "text-gray-300 border-gray-400/40 bg-gray-400/10" :
    rank === 3 ? "text-orange-400 border-orange-400/40 bg-orange-400/10" :
    "text-gray-500 border-gray-700/40 bg-gray-800/40";

  const hasSummary = article.summary && article.summary.trim().length > 20;

  const truncate = (text, max) => {
    if (!text) return "";
    return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(rank * 0.04, 0.4) }}
      className="group flex items-start gap-3 p-3 rounded-xl border border-gray-800/40 hover:border-primary/30 bg-gray-900/20 hover:bg-gray-900/40 transition-all duration-200"
    >
      {/* Rank badge */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border text-[11px] font-bold flex items-center justify-center ${rankColor}`}>
        {String(rank).padStart(2, "0")}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            {article.source || "Unknown"}
          </span>
          {article.date || article.publishedAt ? (
            <>
              <span className="text-gray-700">·</span>
              <span className="text-[10px] text-gray-600">
                {formatDate(article.date || article.publishedAt)}
              </span>
            </>
          ) : null}
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1"
        >
          {article.title}
        </a>

        {hasSummary ? (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {truncate(article.summary, 160)}
          </p>
        ) : (
          <p className="text-xs text-gray-600 italic">No summary available yet.</p>
        )}
      </div>

      {/* External link */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-500 hover:text-primary"
      >
        <FiExternalLink className="w-3.5 h-3.5" />
      </a>
    </motion.div>
  );
}
