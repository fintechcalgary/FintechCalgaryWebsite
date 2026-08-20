"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import PublicPageShell from "@/components/layout/PublicPageShell";
import FinTechChatBot from "@/features/insights/FinTechChatBot";
import WeeklyDigestModal from "@/features/insights/WeeklyDigestModal";
import ArticleDetailModal from "@/features/insights/ArticleDetailModal";
import { OverviewSentimentBar } from "@/features/insights/SentimentBars";
import { ChatBotProvider, useChatBot } from "@/contexts/ChatBotContext";
import ErrorBoundary from "@/components/providers/ErrorBoundary";
import { PageTitle } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";
import Link from "next/link";
import { FiArrowRight, FiAlertCircle, FiSearch } from "react-icons/fi";
import { LoadingState } from "@/components/ui/Spinner";

const extractReadableSource = (article) => {
  const rawSource = (article?.source || "").trim();
  const rawUrl = (article?.url || "").trim();

  const cleanDomain = (value) => {
    if (!value) return "";
    return value
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .toUpperCase();
  };

  const normalizeTitleSource = (title) => {
    if (!title || typeof title !== "string") return "";
    const parts = title
      .split(" - ")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      const candidate = parts[parts.length - 1];
      if (candidate.length > 1 && candidate.length < 40) {
        return candidate.toUpperCase();
      }
    }
    return "";
  };

  if (
    rawSource &&
    !/news\.google\.com/i.test(rawSource) &&
    !/google news/i.test(rawSource)
  ) {
    return cleanDomain(rawSource);
  }

  try {
    const urlObj = new URL(rawUrl);
    const redirectUrl = urlObj.searchParams.get("url");
    if (redirectUrl) {
      return cleanDomain(redirectUrl);
    }
    if (!/news\.google\.com/i.test(urlObj.hostname)) {
      return cleanDomain(urlObj.hostname);
    }
  } catch {}

  const titleSource = normalizeTitleSource(article?.title);
  return titleSource || "UNKNOWN SOURCE";
};

// Fetcher function for SWR - matches original behavior exactly
const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    return undefined;
  }
  return response.json();
};

function InsightsPageContent() {
  const {
    data: weeklyDigestData,
    error: articlesError,
    isLoading: articlesLoading,
  } = useSWR("/api/insights/current", fetcher, {
    refreshInterval: 15 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    onError: (error) => {
      console.error("Failed to fetch articles:", error);
    },
    shouldRetryOnError: false,
    revalidateOnMount: true,
  });

  const handleReadMore = (e, article, summary = null) => {
    e.preventDefault();
    e.stopPropagation();
    // Create a new article object with the locally generated summary if available
    const articleWithSummary = summary ? { ...article, summary } : article;
    setSelectedArticle(articleWithSummary);
    setArticleModalOpen(true);
  };

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR("/api/articles/stats", fetcher, {
    refreshInterval: 15 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    onError: (error) => {
      console.error("Failed to fetch stats:", error);
    },
    shouldRetryOnError: false,
  });

  const { data: refreshData } = useSWR(
    "/api/articles/refresh",
    fetcher,
    {
      refreshInterval: 15 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      shouldRetryOnError: false,
    },
  );

  const [topStories, setTopStories] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [keyInsights, setKeyInsights] = useState(null);
  const [totalArchiveArticles, setTotalArchiveArticles] = useState(0);
  const [digestOpen, setDigestOpen] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const loading = articlesLoading || statsLoading;
  const articles = useMemo(
    () =>
      Array.isArray(weeklyDigestData?.articles)
        ? weeklyDigestData.articles
        : [],
    [weeklyDigestData?.articles],
  );
  const weeklyStats = weeklyDigestData?.stats || null;
  const lastRefresh = refreshData?.lastRefresh
    ? new Date(refreshData.lastRefresh)
    : null;

  const hasConnectionError =
    (articlesError || statsError) && !weeklyDigestData && !statsData;

  useEffect(() => {
    if (!articles || !Array.isArray(articles)) {
      // Guard: update archive count from stats even when weekly articles are empty
      setTotalArchiveArticles(statsData?.overall?.totalArticles || 0);
      setTopStories([]);
      setTrendingTopics([]);
      return;
    }

    setTotalArchiveArticles(statsData?.overall?.totalArticles || 0);

    // Weekly digest already ranks by relevance — use all 15 as-is
    setTopStories(articles);

    const topicCounts = {};
    const topicKeywords = {
      fintech: "FinTech",
      banking: "Banking",
      crypto: "Crypto",
      cryptocurrency: "Cryptocurrency",
      bitcoin: "Bitcoin",
      ethereum: "Ethereum",
      blockchain: "Blockchain",
      payments: "Payments",
      "digital wallet": "Digital Wallet",
      neobank: "Neobank",
      defi: "DeFi",
      nft: "NFT",
      ai: "AI",
      "artificial intelligence": "AI",
      investment: "Investment",
      trading: "Trading",
      "stock market": "Stock Market",
      ipo: "IPO",
      funding: "Funding",
      "venture capital": "Venture Capital",
      startup: "Startup",
      regulation: "Regulation",
      compliance: "Compliance",
      security: "Security",
      fraud: "Fraud",
      cybersecurity: "Cybersecurity",
      "open banking": "Open Banking",
      api: "API",
      cloud: "Cloud",
      saas: "SaaS",
      "mobile banking": "Mobile Banking",
      insurtech: "InsurTech",
      wealthtech: "WealthTech",
      regtech: "RegTech",
    };

    articles.forEach((article) => {
      const title = (article.title || "").toLowerCase();
      const source = (article.source || "").toLowerCase();
      const text = `${title} ${source}`;

      Object.entries(topicKeywords).forEach(([keyword, displayName]) => {
        if (text.includes(keyword)) {
          topicCounts[displayName] = (topicCounts[displayName] || 0) + 1;
        }
      });

      if (article.categories && Array.isArray(article.categories)) {
        article.categories.forEach((cat) => {
          if (cat && cat.trim()) {
            const formatted = cat
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
              )
              .join(" ");
            topicCounts[formatted] = (topicCounts[formatted] || 0) + 1;
          }
        });
      }
    });

    const sortedTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic]) => topic);
    setTrendingTopics(sortedTopics);
  }, [articles, statsData]);

  useEffect(() => {
    if (statsData?.overall || weeklyStats) {
      setKeyInsights({
        totalArticles: articles.length || 0,
        withSummaries:
          articles.filter((a) => a.summary && a.summary.trim()).length || 0,
        uniqueSources:
          new Set(articles.map((a) => a.source).filter(Boolean)).size || 0,
        coverage: 7,
        totalArchiveArticles: statsData?.overall?.totalArticles || 0,
      });
    } else {
      setKeyInsights(null);
    }
  }, [statsData, weeklyStats, articles]);

  const formatLastRefresh = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const calculateSentiment = (articles) => {
    const positiveKeywords = [
      "growth",
      "surge",
      "rise",
      "gain",
      "profit",
      "success",
      "breakthrough",
      "innovation",
      "partnership",
      "expansion",
      "investment",
      "funding",
      "valuation",
      "milestone",
      "record",
      "high",
      "boost",
      "increase",
      "upgrade",
      "positive",
      "strong",
      "win",
      "launch",
      "announce",
      "acquire",
      "merge",
      "deal",
      "raise",
      "secure",
    ];

    const negativeKeywords = [
      "decline",
      "fall",
      "drop",
      "loss",
      "fail",
      "crisis",
      "breach",
      "hack",
      "fraud",
      "scandal",
      "lawsuit",
      "fine",
      "penalty",
      "warning",
      "risk",
      "concern",
      "worry",
      "threat",
      "down",
      "decrease",
      "negative",
      "weak",
      "cut",
      "layoff",
      "close",
      "shutdown",
      "bankrupt",
      "default",
      "crash",
    ];

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    articles.forEach((article) => {
      if (article.sentiment) {
        const sentiment = article.sentiment.toLowerCase();
        if (sentiment === "positive") positive++;
        else if (sentiment === "negative") negative++;
        else neutral++;
        return;
      }

      const title = (article.title || "").toLowerCase();
      const summary = (article.summary || "").toLowerCase();
      const text = `${title} ${summary}`;

      let positiveScore = 0;
      let negativeScore = 0;

      positiveKeywords.forEach((keyword) => {
        if (text.includes(keyword)) positiveScore++;
      });

      negativeKeywords.forEach((keyword) => {
        if (text.includes(keyword)) negativeScore++;
      });

      if (positiveScore > negativeScore && positiveScore > 0) {
        positive++;
      } else if (negativeScore > positiveScore && negativeScore > 0) {
        negative++;
      } else {
        neutral++;
      }
    });

    return { positive, negative, neutral, total: articles.length };
  };

  const sentimentData = calculateSentiment(
    topStories.length > 0 ? topStories : articles.slice(0, 10),
  );

  return (
    <PublicPageShell title="Insights | FinTech Calgary">
      <div className="relative flex-grow">
        <div className="container relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-36 sm:px-8 lg:px-12">
          {hasConnectionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-900/30 p-4 text-sm text-yellow-200"
            >
              <div className="flex items-center gap-2">
                <FiAlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <strong>Database Connection Required:</strong> MongoDB is not
                  connected. Connect to MongoDB to view articles and insights.
                </div>
              </div>
            </motion.div>
          )}

          <div className="mb-16 animate-fadeIn text-center">
            <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
              Insights
            </PageTitle>
            <p className="fc-lede mx-auto mb-6 max-w-3xl">
              Weekly fintech news digests, top stories, and short article
              summaries we track for members
            </p>
            <p className="fc-muted">
              Updated daily
              <span className="mx-2.5 text-white/20" aria-hidden>
                ·
              </span>
              Short article summaries
              {lastRefresh && (
                <>
                  <span className="mx-2.5 text-white/20" aria-hidden>
                    ·
                  </span>
                  Last refresh: {formatLastRefresh(lastRefresh)}
                </>
              )}
            </p>

            {articles.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setDigestOpen(true)}
                  className="fc-btn-soft group !px-5 !py-2.5 !text-sm"
                >
                  <span>This Week&apos;s Full Digest</span>
                  <span className="tabular-nums text-white/70">
                    {articles.length}
                  </span>
                  <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            )}
          </div>

          {keyInsights && (
            <DigestSnapshotStrip
              keyInsights={keyInsights}
              totalArchiveArticles={totalArchiveArticles}
            />
          )}

          <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-8">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <GlowCard
                  customSize
                  glowColor="purple"
                  className="w-full !gap-0 !p-5 sm:!p-6"
                >
                  <div className="relative z-10 mb-4 flex items-center justify-between gap-4">
                    <h2 className="fc-title-accent text-xl sm:text-2xl">
                      This Week&apos;s Top Stories
                    </h2>
                    <Link
                      href="/articles"
                      className="fc-link inline-flex shrink-0 items-center gap-1 text-sm font-medium"
                    >
                      View All
                      <FiArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="relative z-10">
                    {loading ? (
                      <LoadingState size="md" className="py-8" />
                    ) : topStories.length > 0 ? (
                      <div className="space-y-3">
                        {topStories.slice(0, 3).map((article, index) => (
                          <motion.div
                            key={article._id || article.url || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.2 + index * 0.08,
                            }}
                          >
                            <FeaturedArticleCardInner
                              article={article}
                              featured={index === 0}
                              onReadMore={handleReadMore}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="fc-muted">
                          No top stories available yet
                        </p>
                        <p className="mt-2 fc-muted">
                          Check back soon for the latest FinTech news
                        </p>
                      </div>
                    )}
                  </div>
                </GlowCard>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <GlowCard
                  customSize
                  glowColor="purple"
                  className="w-full !gap-0 !p-5 sm:!p-6"
                >
                  <h2 className="fc-title-accent relative z-10 mb-4 text-xl sm:text-2xl">
                    Key Insights
                  </h2>

                  <div className="relative z-10">
                    {keyInsights ? (
                      <div className="space-y-2.5">
                        <InsightCard
                          title="News Coverage"
                          description={`${keyInsights.totalArticles} articles from ${keyInsights.uniqueSources} sources covering ${keyInsights.coverage} days`}
                        />
                        <InsightCard
                          title="Archive Growth"
                          description={`${keyInsights.totalArchiveArticles || totalArchiveArticles} total articles in archive, updated with each weekly digest release`}
                        />
                        <InsightCard
                          title="Trending Now"
                          description={`${trendingTopics.length} topics appearing most often in this week's coverage`}
                        />
                      </div>
                    ) : (
                      <LoadingState size="sm" className="py-6" />
                    )}
                  </div>
                </GlowCard>
              </motion.section>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-4">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <GlowCard
                  customSize
                  glowColor="purple"
                  className="w-full !gap-0 !p-5"
                >
                  <h3 className="fc-title-accent relative z-10 mb-3 text-lg">
                    Trending Topics
                  </h3>

                  <div className="relative z-10">
                    {trendingTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {trendingTopics.map((topic, index) => (
                          <motion.span
                            key={topic}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.3 + index * 0.04,
                            }}
                            className="cursor-pointer whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-gray-200 transition-colors hover:border-primary/40 hover:text-white"
                          >
                            {topic}
                          </motion.span>
                        ))}
                      </div>
                    ) : (
                      <p className="fc-muted">
                        No trending topics yet
                      </p>
                    )}
                  </div>
                </GlowCard>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <GlowCard
                  customSize
                  glowColor="purple"
                  className="w-full !gap-0 !p-5"
                >
                  <h3 className="fc-title-accent relative z-10 mb-3 text-lg">
                    Sentiment Overview
                  </h3>

                  <div className="relative z-10 space-y-3">
                    <OverviewSentimentBar
                      label="Positive"
                      value={sentimentData.total > 0 ? sentimentData.positive : 0}
                      total={sentimentData.total > 0 ? sentimentData.total : 1}
                      color="green"
                    />
                    <OverviewSentimentBar
                      label="Neutral"
                      value={sentimentData.total > 0 ? sentimentData.neutral : 0}
                      total={sentimentData.total > 0 ? sentimentData.total : 1}
                      color="gray"
                    />
                    <OverviewSentimentBar
                      label="Negative"
                      value={sentimentData.total > 0 ? sentimentData.negative : 0}
                      total={sentimentData.total > 0 ? sentimentData.total : 1}
                      color="red"
                    />
                  </div>
                </GlowCard>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <GlowCard
                  customSize
                  glowColor="purple"
                  className="w-full !gap-0 !p-5"
                >
                  <div className="relative z-10 text-center">
                    <h3 className="fc-title-accent mb-2 text-lg">
                      Full archive
                    </h3>
                    <p className="fc-body mb-4">
                      Browse every saved article with filters and search
                    </p>
                    <Link
                      href="/articles"
                      className="fc-btn-gradient-primary px-5 py-2.5"
                    >
                      Browse All Articles
                      <FiArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </GlowCard>
              </motion.section>
            </div>
          </div>
        </div>
      </div>

      <FinTechChatBot articles={articles} />

      <WeeklyDigestModal
        isOpen={digestOpen}
        onClose={() => setDigestOpen(false)}
        articles={articles}
        stats={weeklyStats}
        weekStart={weeklyDigestData?.weekStart}
        weekEnd={weeklyDigestData?.weekEnd}
      />

      <ArticleDetailModal
        isOpen={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        article={selectedArticle}
      />
    </PublicPageShell>
  );
}

export default function InsightsPage() {
  return (
    <ErrorBoundary>
      <ChatBotProvider>
        <InsightsPageContent />
      </ChatBotProvider>
    </ErrorBoundary>
  );
}

function DigestSnapshotStrip({ keyInsights, totalArchiveArticles }) {
  const digestCount = keyInsights.totalArticles ?? 0;
  const archiveCount =
    keyInsights.totalArchiveArticles ?? totalArchiveArticles ?? 0;
  const sourcesCount = keyInsights.uniqueSources ?? 0;
  const daysCount = keyInsights.coverage ?? 0;

  const segments = [
    { value: digestCount, phrase: "articles this week" },
    { value: archiveCount, phrase: "in the archive" },
    { value: sourcesCount, phrase: "news sources" },
    { value: daysCount, phrase: "days covered" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="mb-4 md:mb-6"
      aria-label="Digest snapshot statistics"
    >
      <div className="relative overflow-hidden rounded-none md:rounded-sm">
        {/* Top rule — single continuous band, no per-stat boxes */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex flex-col items-center gap-4 px-2 py-6 md:gap-5 md:px-6 md:py-8">
          <p className="fc-muted text-center text-xs md:text-sm">
            This week at a glance
          </p>

          <p className="fc-body mx-auto max-w-3xl text-center md:text-lg md:leading-[1.75]">
            {segments.map((seg, i) => (
              <span key={seg.phrase} className="inline">
                {i > 0 && (
                  <span
                    className="mx-2 inline text-white/25 md:mx-3"
                    aria-hidden
                  >
                    ·
                  </span>
                )}
                <span className="font-semibold tabular-nums tracking-tight text-white">
                  {seg.value}
                </span>
                <span className="fc-muted"> {seg.phrase}</span>
              </span>
            ))}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedArticleCardInner({ article, featured = false, onReadMore }) {
  const [isHovered, setIsHovered] = useState(false);
  const { openChatWithArticle } = useChatBot();

  // Summaries are pre-generated at refresh time — display stored value only.
  const summary = article.summary || null;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCheckoutToAI = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (openChatWithArticle) {
      openChatWithArticle(article);
    }
  };

  const truncateWords = (text, maxWords = 42) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return `${words.slice(0, maxWords).join(" ")}...`;
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {openChatWithArticle && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCheckoutToAI}
          className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-primary/90 text-white transition-colors duration-200 hover:bg-primary"
          title="Analyze with AI"
        >
          <FiSearch className="h-4 w-4" />
        </motion.button>
      )}

      <div
        className={`fc-card relative overflow-hidden !rounded-xl p-0 ${
          isHovered ? "!border-primary/50" : ""
        }`}
      >
        <div
          className={`flex gap-4 p-3.5 ${
            featured ? "flex-col md:flex-row" : "flex-row"
          }`}
        >
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="mb-1 flex flex-wrap items-center gap-2 fc-muted text-xs">
              <span className="font-medium uppercase tracking-wide">
                {extractReadableSource(article)}
              </span>
              <span>•</span>
              <span>{formatDate(article.date || article.publishedAt)}</span>
              {featured && (
                <>
                  <span>•</span>
                  <span className="rounded-md border border-primary/30 bg-primary/20 px-2 py-0.5 text-xs text-primary">
                    Featured
                  </span>
                </>
              )}
            </div>
            <h3 className="fc-title mb-2 line-clamp-2 text-lg transition-colors group-hover:text-primary">
              {article.title}
            </h3>
            <button
              onClick={(e) => onReadMore(e, article, summary)}
              className="inline-flex w-fit items-center gap-1 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10 px-3 py-1.5 text-xs text-primary transition-all duration-200 hover:border-primary/50 hover:from-primary/20 hover:to-purple-500/20"
            >
              Read more
              <FiArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-0 bg-gray-900/95 p-4 transition-opacity duration-150 ${
            isHovered
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="min-h-0 flex-1 overflow-hidden">
              {summary ? (
                <p className="fc-body line-clamp-3">
                  {truncateWords(summary, 60)}
                </p>
              ) : (
                <p className="fc-muted text-xs italic">
                  Summary will be available after the weekly digest refresh.
                </p>
              )}
            </div>
            <div className="mt-2 flex shrink-0 items-center gap-2 text-xs text-primary">
              <button
                onClick={(e) => onReadMore(e, article, summary)}
                className="fc-btn-read-more-subtle"
              >
                <span>Read more</span>
                <FiArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ title, description }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-primary/30 hover:bg-white/[0.04]">
      <h4 className="fc-title mb-0.5 text-base">{title}</h4>
      <p className="fc-muted">{description}</p>
    </div>
  );
}
