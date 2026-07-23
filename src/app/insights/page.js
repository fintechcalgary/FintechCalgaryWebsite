"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import FinTechChatBot from "@/features/insights/FinTechChatBot";
import WeeklyDigestModal from "@/features/insights/WeeklyDigestModal";
import ArticleDetailModal from "@/features/insights/ArticleDetailModal";
import { OverviewSentimentBar } from "@/features/insights/SentimentBars";
import { ChatBotProvider, useChatBot } from "@/contexts/ChatBotContext";
import ErrorBoundary from "@/components/providers/ErrorBoundary";
import Link from "next/link";
import { FiArrowRight, FiAlertCircle, FiSearch } from "react-icons/fi";

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

  const { openChatWithArticle } = useChatBot();

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
    document.title = "FinTech Insights & Trends | FinTech Calgary";
  }, []);

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
    <ErrorBoundary>
      <ChatBotProvider>
        <main className="flex flex-col min-h-screen">
          <PublicNavbar />

          <section className="relative overflow-hidden pt-36 pb-16">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
              {hasConnectionError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl text-yellow-200 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5" />
                    <div>
                      <strong>Database Connection Required:</strong> MongoDB is
                      not connected. Connect to MongoDB to view articles and
                      insights. The UI improvements are still active.
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[1.08] pb-2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400/75">
                  FinTech Insights
                </h1>
                <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
                  Your command center for the latest FinTech trends, top
                  stories, and AI-curated insights
                </p>
                <p className="text-sm text-gray-500">
                  Updated daily
                  <span className="mx-2.5 text-white/20" aria-hidden>
                    ·
                  </span>
                  AI-powered summaries
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
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="flex justify-center mt-6"
                  >
                    <button
                      onClick={() => setDigestOpen(true)}
                      className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-colors duration-200"
                    >
                      <span>This Week&apos;s Full Digest</span>
                      <span className="text-gray-500 tabular-nums">
                        {articles.length}
                      </span>
                      <FiArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {keyInsights && (
                <DigestSnapshotStrip
                  keyInsights={keyInsights}
                  totalArchiveArticles={totalArchiveArticles}
                />
              )}
            </div>
          </section>

          <div className="container mx-auto px-6 pt-0 pb-12 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      This Week&apos;s Top Stories
                    </h2>
                    <Link
                      href="/articles"
                      className="text-sm text-primary hover:text-purple-400 transition-colors inline-flex items-center gap-1"
                    >
                      View All
                      <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex-1 flex flex-col">
                    {loading ? (
                      <div className="space-y-4 flex-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-32 bg-gray-800/50 rounded-xl border border-gray-700/30 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : topStories.length > 0 ? (
                      <div className="space-y-4 flex-1">
                        {topStories.slice(0, 3).map((article, index) => (
                          <motion.div
                            key={article._id || article.url || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.4 + index * 0.1,
                            }}
                          >
                            <FeaturedArticleCardInner
                              article={article}
                              featured={index === 0}
                              openChatWithArticle={openChatWithArticle}
                              onReadMore={handleReadMore}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center flex-1">
                        <p className="text-gray-400">
                          No top stories available yet
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Check back soon for the latest FinTech news
                        </p>
                      </div>
                    )}
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 flex-1 flex flex-col"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Key Insights
                  </h2>

                  <div className="flex-1 flex flex-col">
                    {keyInsights ? (
                      <div className="space-y-4 flex-1">
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
                          description={`${trendingTopics.length} topics are trending across FinTech news, indicating active industry movement`}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
                        <p className="text-gray-400">Loading insights...</p>
                      </div>
                    )}
                  </div>
                </motion.section>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 flex-1 flex flex-col min-h-0"
                >
                  <h3 className="text-xl font-bold text-white mb-6">
                    Trending Topics
                  </h3>

                  <div className="flex-1 flex flex-col min-h-0 justify-center">
                    {trendingTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5 justify-center items-center">
                        {trendingTopics.map((topic, index) => (
                          <motion.span
                            key={topic}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.5 + index * 0.05,
                            }}
                            className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm font-medium text-gray-200 hover:border-primary/40 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {topic}
                          </motion.span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-gray-400 text-sm">
                          No trending topics yet
                        </p>
                      </div>
                    )}
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 flex-1 flex flex-col min-h-0"
                >
                  <h3 className="text-xl font-bold text-white mb-6">
                    Sentiment Overview
                  </h3>

                  <div className="flex-1 flex flex-col min-h-0 justify-center">
                    {sentimentData.total > 0 ? (
                      <div className="space-y-4">
                        <OverviewSentimentBar
                          label="Positive"
                          value={sentimentData.positive}
                          total={sentimentData.total}
                          color="green"
                        />
                        <OverviewSentimentBar
                          label="Neutral"
                          value={sentimentData.neutral}
                          total={sentimentData.total}
                          color="gray"
                        />
                        <OverviewSentimentBar
                          label="Negative"
                          value={sentimentData.negative}
                          total={sentimentData.total}
                          color="red"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <OverviewSentimentBar
                          label="Positive"
                          value={0}
                          total={1}
                          color="green"
                        />
                        <OverviewSentimentBar
                          label="Neutral"
                          value={0}
                          total={1}
                          color="gray"
                        />
                        <OverviewSentimentBar
                          label="Negative"
                          value={0}
                          total={1}
                          color="red"
                        />
                      </div>
                    )}
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border border-primary/30 flex-1 flex flex-col min-h-0 justify-center"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-2">
                      Explore Deeper
                    </h3>
                    <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                      Dive into our complete article collection with advanced
                      filters and search
                    </p>
                    <Link
                      href="/articles"
                      className="fc-btn-gradient-primary px-5 py-2.5"
                    >
                      Browse All Articles
                      <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.section>
              </div>
            </div>
          </div>

          <Footer />

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
        </main>
      </ChatBotProvider>
    </ErrorBoundary>
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
          <p className="text-center text-xs font-medium text-gray-500 md:text-sm">
            This week at a glance
          </p>

          <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-gray-400 md:text-lg md:leading-[1.75]">
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
                <span className="font-semibold tabular-nums text-white">
                  {seg.value}
                </span>
                <span className="text-gray-500"> {seg.phrase}</span>
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
      className="relative group"
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
          className="absolute bottom-3 right-3 z-20 w-9 h-9 rounded-xl bg-primary/90 hover:bg-primary flex items-center justify-center text-white border border-white/10 transition-colors duration-200"
          title="Analyze with AI"
        >
          <FiSearch className="w-4 h-4" />
        </motion.button>
      )}

      <div
        className={`relative bg-gray-900/30 rounded-xl border border-gray-700/30 overflow-hidden transition-all duration-300 min-h-36 ${
          isHovered ? "border-primary/50" : ""
        }`}
      >
        <div
          className={`flex ${featured ? "flex-col md:flex-row" : "flex-row"} gap-4 p-4 h-full`}
        >
          <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-1 text-xs text-gray-400 flex-wrap">
              <span className="font-medium uppercase">
                {extractReadableSource(article)}
              </span>
              <span>•</span>
              <span>{formatDate(article.date || article.publishedAt)}</span>
              {featured && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-xs">
                    Featured
                  </span>
                </>
              )}
            </div>
            <h3
              className={`font-semibold text-white group-hover:text-primary transition-colors mb-2 text-lg line-clamp-2`}
            >
              {article.title}
            </h3>
            <button
              onClick={(e) => onReadMore(e, article, summary)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-xl text-xs text-primary hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 w-fit"
            >
              Read more
              <FiArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-0 p-4 bg-gray-900/95 transition-opacity duration-150 ${
            isHovered
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-hidden">
              {summary ? (
                <p className="text-gray-300 leading-relaxed line-clamp-3 text-sm">
                  {truncateWords(summary, 60)}
                </p>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Summary will be available after the weekly digest refresh.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-primary mt-2 flex-shrink-0">
              <button
                onClick={(e) => onReadMore(e, article, summary)}
                className="fc-btn-read-more-subtle"
              >
                <span>Read more</span>
                <FiArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
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
    <div className="p-4 rounded-lg border border-white/[0.06] hover:border-white/10 transition-colors">
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
