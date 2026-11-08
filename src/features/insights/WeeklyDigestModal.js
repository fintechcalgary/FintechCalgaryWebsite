"use client";
import {
  BTN_GRADIENT_PRIMARY_CLASS,
  GLASS_CARD_CLASS,
  ICON_GLYPH_CLASS,
  MODAL_ASIDE_CLASS,
  MODAL_BODY_CLASS,
  MODAL_CALLOUT_CLASS,
  MODAL_ICON_CLOSE_CLASS,
  TOPIC_CHIP_CLASS,
} from "@/lib/uiTokens";

import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiExternalLink,
  FiZap,
  FiCalendar,
  FiGlobe,
  FiMessageCircle,
} from "react-icons/fi";
import { useChatBot } from "@/contexts/ChatBotContext";
import BleedModal, {
  BleedModalHeader,
} from "@/components/ui/Modal/BleedModal";
import { CompactSentimentBar } from "@/features/insights/SentimentBars";
import { formatDateMonthDay } from "@/lib/dates";
import { extractReadableSource } from "@/lib/article-display";

function getIssueNumber(weekStart) {
  if (!weekStart) return null;
  const origin = new Date("2024-09-02"); // FinTech Calgary season start
  const start = new Date(weekStart);
  const weeks = Math.max(
    1,
    Math.round((start - origin) / (7 * 24 * 60 * 60 * 1000)) + 1,
  );
  return weeks;
}

function formatWeekRange(weekStart, weekEnd) {
  if (!weekStart) return null;
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  return weekEnd ? `${fmt(weekStart)} – ${fmt(weekEnd)}` : fmt(weekStart);
}

export default function WeeklyDigestModal({
  isOpen,
  onClose,
  articles = [],
  weekStart,
  weekEnd,
  stats = null,
}) {
  const scrollRef = useRef(null);
  const { setIsOpen: setChatOpen } = useChatBot();

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
  const topics = (
    stats?.topics?.length ? stats.topics : calculatedStats.topics
  ).slice(0, 6);

  const sources =
    articles.length > 0
      ? new Set(articles.map((a) => a.source).filter(Boolean)).size
      : 0;

  const handleOpenChat = () => {
    onClose();
    setTimeout(() => setChatOpen(true), 200);
  };

  return (
    <BleedModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Weekly FinTech Digest"
      bodyRef={scrollRef}
      header={
        <BleedModalHeader
          onClose={onClose}
          closeLabel="Close weekly digest"
          title={
            <h2 className="modal-title flex flex-wrap items-baseline gap-x-2 !text-2xl leading-tight sm:!text-3xl">
              <span>
                Weekly <span className="heading-accent inline">FinTech Digest</span>
              </span>
              {issueNumber ? (
                <span className="tabular-nums text-white/90">
                  Issue #{issueNumber}
                </span>
              ) : null}
            </h2>
          }
          subtitle={
            weekRange ? (
              <p className="text-muted mt-2 flex items-start gap-2 text-sm leading-snug sm:items-center">
                <FiCalendar className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" />
                <span className="min-w-0 break-words">{weekRange}</span>
              </p>
            ) : null
          }
          meta={
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-muted inline flex items-center gap-1.5 text-xs">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  aria-hidden
                />
                {articles.length} curated stories
              </p>
              <p className="text-muted inline flex items-center gap-1.5 text-xs">
                <FiGlobe className="h-3 w-3" />
                {sources} sources
              </p>
              <p className="text-muted inline flex items-center gap-1.5 text-xs">
                <FiZap className="h-3 w-3" />
                AI-summarized
              </p>
              <p className="text-muted inline flex items-center gap-1.5 text-xs">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400/80"
                  aria-hidden
                />
                Refreshed every Friday
              </p>
            </div>
          }
        />
      }
    >
      <div className="flex min-h-0 flex-col gap-0 lg:flex-row">
        <div className={`${MODAL_BODY_CLASS} min-w-0 flex-1 space-y-3 !py-4 sm:!py-5`.trim()}>
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className={`${ICON_GLYPH_CLASS} mb-4`.trim()}>
                <FiZap className="h-6 w-6" />
              </span>
              <p>No digest available yet.</p>
              <p className="text-muted mt-1">
                Check back after the next Friday refresh.
              </p>
            </div>
          ) : (
            articles.map((article, index) => (
              <DigestArticleRow
                key={article._id || article.url || index}
                article={article}
                rank={index + 1}
              />
            ))
          )}
        </div>

        <aside className={MODAL_ASIDE_CLASS}>
          {sentiment && sentiment.total > 0 && (
            <div>
              <p className="eyebrow">Market Sentiment</p>
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
              <div className={`${MODAL_CALLOUT_CLASS} mt-3 px-3 py-2.5 text-center`.trim()}>
                <p className="text-muted inline text-xs">Overall mood: </p>
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
              <p className="eyebrow">This Week&apos;s Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {topics.map(({ topic, count }) => (
                  <span
                    key={topic}
                    className={`${TOPIC_CHIP_CLASS} !cursor-default capitalize`.trim()}
                  >
                    {topic}
                    <span className="ml-1 text-[10px] opacity-60">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={MODAL_CALLOUT_CLASS}>
            <div className="mb-2 flex items-center gap-2">
              <FiMessageCircle className="h-4 w-4 text-primary" />
              <h4 className="text-sm">Ask the Digest</h4>
            </div>
            <p className="text-muted mb-3 text-xs leading-relaxed">
              Chat with AI about this week&apos;s stories — ask questions, get
              deeper analysis.
            </p>
            <button
              type="button"
              onClick={handleOpenChat}
              className={`${BTN_GRADIENT_PRIMARY_CLASS} w-full px-3 py-2 text-xs font-semibold`.trim()}
            >
              Open AI Chat →
            </button>
          </div>
        </aside>
      </div>
    </BleedModal>
  );
}

function DigestArticleRow({ article, rank }) {
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
      className={`${GLASS_CARD_CLASS} group flex min-w-0 items-start gap-2.5 !rounded-xl p-3 sm:gap-3 sm:p-3.5 hover:border-primary/40`.trim()}
    >
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold tabular-nums ${rankColor}`}
      >
        {String(rank).padStart(2, "0")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="text-muted inline text-[10px] font-medium uppercase tracking-wide">
            {extractReadableSource(article)}
          </p>
          {article.date || article.publishedAt ? (
            <>
              <span className="text-white/20" aria-hidden>
                ·
              </span>
              <p className="text-muted inline text-[10px]">
                {formatDateMonthDay(article.date || article.publishedAt)}
              </p>
            </>
          ) : null}
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent mb-1 block text-sm font-display font-semibold leading-snug tracking-tight text-white transition-colors line-clamp-2 group-hover:text-primary"
        >
          {article.title}
        </a>

        {hasSummary ? (
          <p className="line-clamp-2 !text-xs">
            {truncate(article.summary, 160)}
          </p>
        ) : (
          <p className="text-muted text-xs italic">No summary available yet.</p>
        )}
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${MODAL_ICON_CLOSE_CLASS} !opacity-0 group-hover:!opacity-100`.trim()}
        aria-label="Open article"
      >
        <FiExternalLink className="h-3.5 w-3.5" />
      </a>
    </motion.div>
  );
}
