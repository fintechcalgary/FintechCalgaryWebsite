"use client";

import { useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiExternalLink,
  FiZap,
  FiCalendar,
  FiGlobe,
  FiMessageCircle,
} from "react-icons/fi";
import { useChatBot } from "@/contexts/ChatBotContext";
import { useModalBodyEffects } from "@/hooks/useModalBodyEffects";
import FramerModalBackdrop from "@/components/ui/FramerModalBackdrop";
import { CompactSentimentBar } from "@/features/insights/SentimentBars";

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

export default function WeeklyDigestModal({ isOpen, onClose, articles = [], weekStart, weekEnd, stats = null }) {
  const scrollRef = useRef(null);
  const { setIsOpen: setChatOpen } = useChatBot();

  useModalBodyEffects(isOpen, onClose);

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
          <FramerModalBackdrop
            motionKey="backdrop"
            onClose={onClose}
            className="bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Weekly FinTech Digest"
            className="fixed inset-4 z-[60] flex flex-col overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/95 via-gray-900 to-gray-950 shadow-2xl shadow-black/50 md:inset-8 lg:inset-x-16 lg:inset-y-8 xl:inset-x-28"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Soft ambient glows */}
            <div
              className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-10 top-24 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl"
              aria-hidden
            />

            <button
              type="button"
              aria-label="Close weekly digest"
              onClick={onClose}
              className="fc-modal-icon-close absolute right-4 top-4 z-20"
            >
              <FiX className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="relative flex-shrink-0 border-b border-gray-800/50 px-6 pb-5 pt-6">
              <div className="relative z-[1] pr-10">
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/15 px-2.5 py-1 text-xs font-medium tracking-wide text-primary">
                    <FiZap className="h-3 w-3" />
                    FinTech Calgary
                  </span>
                  {issueNumber && (
                    <span className="fc-muted text-xs tabular-nums">
                      Issue #{issueNumber}
                    </span>
                  )}
                </div>

                <h2 className="fc-title-lg mb-1.5">
                  Weekly{" "}
                  <span className="fc-title-accent">FinTech Digest</span>
                </h2>

                {weekRange && (
                  <p className="fc-muted flex items-center gap-2">
                    <FiCalendar className="h-3.5 w-3.5 shrink-0" />
                    {weekRange}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="fc-muted flex items-center gap-1.5 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                    {articles.length} curated stories
                  </span>
                  <span className="fc-muted flex items-center gap-1.5 text-xs">
                    <FiGlobe className="h-3 w-3" />
                    {sources} sources
                  </span>
                  <span className="fc-muted flex items-center gap-1.5 text-xs">
                    <FiZap className="h-3 w-3" />
                    AI-summarized
                  </span>
                  <span className="fc-muted flex items-center gap-1.5 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" aria-hidden />
                    Refreshed every Friday
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
              <div className="flex h-full flex-col gap-0 lg:flex-row">
                {/* Article list */}
                <div className="min-w-0 flex-1 space-y-3 px-6 py-5">
                  {articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gray-700/40 bg-white/[0.03]">
                        <FiZap className="h-6 w-6 text-white/35" />
                      </div>
                      <p className="fc-body">No digest available yet.</p>
                      <p className="fc-muted mt-1">
                        Check back after the next Friday refresh.
                      </p>
                    </div>
                  ) : (
                    articles.map((article, index) => (
                      <DigestArticleRow
                        key={article._id || article.url || index}
                        article={article}
                        rank={index + 1}
                        formatDate={formatDate}
                      />
                    ))
                  )}
                </div>

                {/* Sidebar */}
                <aside className="flex-shrink-0 space-y-6 border-t border-gray-800/50 px-5 py-5 lg:w-64 lg:border-l lg:border-t-0 xl:w-72">
                  {sentiment && sentiment.total > 0 && (
                    <div>
                      <h4 className="fc-muted mb-3 text-xs font-medium uppercase tracking-wider">
                        Market Sentiment
                      </h4>
                      <div className="space-y-3">
                        <CompactSentimentBar
                          label="Positive"
                          value={sentiment.positive}
                          total={sentiment.total}
                          colorClass="text-green-400"
                          bgClass="bg-gradient-to-r from-green-500 to-emerald-400"
                        />
                        <CompactSentimentBar
                          label="Neutral"
                          value={sentiment.neutral}
                          total={sentiment.total}
                          colorClass="text-gray-400"
                          bgClass="bg-gray-500"
                        />
                        <CompactSentimentBar
                          label="Negative"
                          value={sentiment.negative}
                          total={sentiment.total}
                          colorClass="text-red-400"
                          bgClass="bg-gradient-to-r from-red-500 to-rose-400"
                        />
                      </div>
                      <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-center backdrop-blur-sm">
                        <span className="fc-muted text-xs">Overall mood: </span>
                        <span
                          className={`text-xs font-semibold ${
                            sentiment.positive > sentiment.negative
                              ? "text-green-400"
                              : sentiment.negative > sentiment.positive
                                ? "text-red-400"
                                : "text-white/55"
                          }`}
                        >
                          {sentiment.positive > sentiment.negative
                            ? "Bullish"
                            : sentiment.negative > sentiment.positive
                              ? "Cautious"
                              : "Mixed"}
                        </span>
                      </div>
                    </div>
                  )}

                  {topics.length > 0 && (
                    <div>
                      <h4 className="fc-muted mb-3 text-xs font-medium uppercase tracking-wider">
                        This Week&apos;s Topics
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {topics.map(({ topic, count }, i) => (
                          <span
                            key={topic}
                            className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                              i < 3
                                ? "border-primary/30 bg-primary/15 text-primary"
                                : "border-white/[0.08] bg-white/[0.03] text-white/55"
                            }`}
                          >
                            {topic}
                            <span className="ml-1 text-[10px] opacity-60">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 via-purple-600/10 to-violet-400/10 p-4 backdrop-blur-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <FiMessageCircle className="h-4 w-4 text-primary" />
                      <span className="fc-title text-sm">Ask the Digest</span>
                    </div>
                    <p className="fc-muted mb-3 text-xs leading-relaxed">
                      Chat with AI about this week&apos;s stories — ask questions, get deeper analysis.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenChat}
                      className="fc-btn-gradient-primary w-full px-3 py-2 text-xs font-semibold"
                    >
                      Open AI Chat →
                    </button>
                  </div>
                </aside>
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
    rank === 1
      ? "border-amber-400/35 bg-amber-400/10 text-amber-300"
      : rank === 2
        ? "border-white/20 bg-white/[0.06] text-white/80"
        : rank === 3
          ? "border-orange-400/35 bg-orange-400/10 text-orange-300"
          : "border-white/[0.08] bg-white/[0.03] text-white/40";

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
      className="fc-card group flex items-start gap-3 !rounded-xl p-3.5 hover:border-primary/40"
    >
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold tabular-nums ${rankColor}`}
      >
        {String(rank).padStart(2, "0")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="fc-muted text-[10px] font-medium uppercase tracking-wide">
            {article.source || "Unknown"}
          </span>
          {article.date || article.publishedAt ? (
            <>
              <span className="text-white/20" aria-hidden>
                ·
              </span>
              <span className="fc-muted text-[10px]">
                {formatDate(article.date || article.publishedAt)}
              </span>
            </>
          ) : null}
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="fc-title mb-1 block text-sm leading-snug transition-colors line-clamp-2 group-hover:text-primary"
        >
          {article.title}
        </a>

        {hasSummary ? (
          <p className="fc-body line-clamp-2 !text-xs">{truncate(article.summary, 160)}</p>
        ) : (
          <p className="fc-muted text-xs italic">No summary available yet.</p>
        )}
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 rounded-xl p-1.5 text-white/35 opacity-0 transition-all hover:bg-white/[0.06] hover:text-primary group-hover:opacity-100"
        aria-label="Open article"
      >
        <FiExternalLink className="h-3.5 w-3.5" />
      </a>
    </motion.div>
  );
}
