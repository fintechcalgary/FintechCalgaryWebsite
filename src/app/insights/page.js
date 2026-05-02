"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import ArticleCard from "@/components/digest/ArticleCard";
import FinTechChatBot from "@/components/insights/FinTechChatBot";
import { ChatBotProvider, useChatBot } from "@/contexts/ChatBotContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Link from "next/link";
import {
  FiTrendingUp,
  FiZap,
  FiBarChart2,
  FiArrowRight,
  FiClock,
  FiEye,
  FiStar,
  FiTarget,
  FiGlobe,
  FiCalendar,
  FiAlertCircle,
  FiSearch,
} from "react-icons/fi";

// Fetcher function for SWR - matches original behavior exactly
const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    return undefined;
  }
  return response.json();
};

export default function InsightsPage() {
  const pendingArticlesRequest = useRef(null);
  const pendingStatsRequest = useRef(null);
  const pendingRefreshRequest = useRef(null);

  const { data: articlesData, error: articlesError, isLoading: articlesLoading, mutate: mutateArticles } = useSWR(
    "/api/articles?limit=50&sortBy=date_desc",
    fetcher,
    {
      refreshInterval: 15 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onError: (error) => {
        console.error("Failed to fetch articles:", error);
      },
      shouldRetryOnError: false,
      revalidateOnMount: true,
    }
  );

  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR(
    "/api/articles/stats",
    fetcher,
    {
      refreshInterval: 15 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onError: (error) => {
        console.error("Failed to fetch stats:", error);
      },
      shouldRetryOnError: false,
    }
  );

  const { data: refreshData, mutate: mutateRefresh } = useSWR(
    "/api/articles/refresh",
    fetcher,
    {
      refreshInterval: 15 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      shouldRetryOnError: false,
    }
  );

  const [topStories, setTopStories] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [keyInsights, setKeyInsights] = useState(null);
  const [articlesToday, setArticlesToday] = useState(0);

  const loading = articlesLoading || statsLoading;
  const articles = articlesData || [];
  const stats = statsData?.overall || null;
  const lastRefresh = refreshData?.lastRefresh ? new Date(refreshData.lastRefresh) : null;

  const hasConnectionError = (articlesError || statsError) && !articlesData && !statsData;

  useEffect(() => {
    document.title = "FinTech Insights & Trends | FinTech Calgary";

    const autoFetchIfEmpty = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!articlesLoading && (!articlesData || articlesData.length === 0)) {
        console.log("No articles found, attempting to fetch from RSS feeds...");
        try {
          const response = await fetch("/api/articles/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            const data = await response.json();
            setTimeout(() => {
              mutateArticles();
              mutateRefresh();
            }, 2000);
          }
        } catch (error) {
          console.warn("Auto-fetch failed (this is normal if not admin):", error.message);
        }
      }
    };

    autoFetchIfEmpty();
  }, [articlesLoading, articlesData, mutateArticles, mutateRefresh]);

  useEffect(() => {
    if (!articlesData || !Array.isArray(articlesData)) {
      if (articlesData === null || articlesData === undefined) {
        return;
      }
      setArticlesToday(0);
      setTopStories([]);
      setTrendingTopics([]);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayArticles = articlesData.filter(article => {
      const articleDate = article.date || article.publishedAt;
      if (!articleDate) return false;
      const dateStr = typeof articleDate === 'string'
        ? articleDate.split('T')[0]
        : new Date(articleDate).toISOString().split('T')[0];
      return dateStr === today;
    });
    setArticlesToday(todayArticles.length);

    const sortedForTopStories = [...articlesData].sort((a, b) => {
      const aHasSummary = a.summary && a.summary.trim().length > 0;
      const bHasSummary = b.summary && b.summary.trim().length > 0;

      if (aHasSummary && !bHasSummary) return -1;
      if (!aHasSummary && bHasSummary) return 1;

      const aDate = new Date(a.date || a.publishedAt || a.createdAt || 0);
      const bDate = new Date(b.date || b.publishedAt || b.createdAt || 0);
      return bDate - aDate;
    });

    const topStoriesList = sortedForTopStories.slice(0, 6);
    setTopStories(topStoriesList);

    const topicCounts = {};
    const topicKeywords = {
      'fintech': 'FinTech',
      'banking': 'Banking',
      'crypto': 'Crypto',
      'cryptocurrency': 'Cryptocurrency',
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'blockchain': 'Blockchain',
      'payments': 'Payments',
      'digital wallet': 'Digital Wallet',
      'neobank': 'Neobank',
      'defi': 'DeFi',
      'nft': 'NFT',
      'ai': 'AI',
      'artificial intelligence': 'AI',
      'investment': 'Investment',
      'trading': 'Trading',
      'stock market': 'Stock Market',
      'ipo': 'IPO',
      'funding': 'Funding',
      'venture capital': 'Venture Capital',
      'startup': 'Startup',
      'regulation': 'Regulation',
      'compliance': 'Compliance',
      'security': 'Security',
      'fraud': 'Fraud',
      'cybersecurity': 'Cybersecurity',
      'open banking': 'Open Banking',
      'api': 'API',
      'cloud': 'Cloud',
      'saas': 'SaaS',
      'mobile banking': 'Mobile Banking',
      'insurtech': 'InsurTech',
      'wealthtech': 'WealthTech',
      'regtech': 'RegTech'
    };

    articlesData.forEach(article => {
      const title = (article.title || '').toLowerCase();
      const source = (article.source || '').toLowerCase();
      const text = `${title} ${source}`;

      Object.entries(topicKeywords).forEach(([keyword, displayName]) => {
        if (text.includes(keyword)) {
          topicCounts[displayName] = (topicCounts[displayName] || 0) + 1;
        }
      });

      if (article.categories && Array.isArray(article.categories)) {
        article.categories.forEach(cat => {
          if (cat && cat.trim()) {
            const formatted = cat.split(' ').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
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
  }, [articlesData]);

  useEffect(() => {
    if (statsData?.overall) {
      setKeyInsights({
        totalArticles: statsData.overall.totalArticles || 0,
        withSummaries: statsData.overall.totalWithSummary || 0,
        uniqueSources: statsData.overall.uniqueSources || 0,
        coverage: statsData.overall.daysWithArticles || 0,
      });
    } else {
      setKeyInsights(null);
    }
  }, [statsData]);

  const formatLastRefresh = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const calculateSentiment = (articles) => {
    const positiveKeywords = [
      'growth', 'surge', 'rise', 'gain', 'profit', 'success', 'breakthrough', 'innovation',
      'partnership', 'expansion', 'investment', 'funding', 'valuation', 'milestone',
      'record', 'high', 'boost', 'increase', 'upgrade', 'positive', 'strong', 'win',
      'launch', 'announce', 'acquire', 'merge', 'deal', 'raise', 'secure'
    ];

    const negativeKeywords = [
      'decline', 'fall', 'drop', 'loss', 'fail', 'crisis', 'breach', 'hack',
      'fraud', 'scandal', 'lawsuit', 'fine', 'penalty', 'warning', 'risk',
      'concern', 'worry', 'threat', 'down', 'decrease', 'negative', 'weak',
      'cut', 'layoff', 'close', 'shutdown', 'bankrupt', 'default', 'crash'
    ];

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    articles.forEach(article => {
      if (article.sentiment) {
        const sentiment = article.sentiment.toLowerCase();
        if (sentiment === 'positive') positive++;
        else if (sentiment === 'negative') negative++;
        else neutral++;
        return;
      }

      const title = (article.title || '').toLowerCase();
      const summary = (article.summary || '').toLowerCase();
      const text = `${title} ${summary}`;

      let positiveScore = 0;
      let negativeScore = 0;

      positiveKeywords.forEach(keyword => {
        if (text.includes(keyword)) positiveScore++;
      });

      negativeKeywords.forEach(keyword => {
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

  const sentimentData = calculateSentiment(topStories.length > 0 ? topStories : articles.slice(0, 10));

  return (
    <ErrorBoundary>
      <ChatBotProvider>
        <main className="flex flex-col min-h-screen">
          <PublicNavbar />

      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

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
                  <strong>Database Connection Required:</strong> MongoDB is not connected.
                  Connect to MongoDB to view articles and insights. The UI improvements are still active.
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
              <FiStar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Insights</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500">
              FinTech Insights
            </h1>
            <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Your command center for the latest FinTech trends, top stories, and AI-curated insights
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                <span>Updated daily</span>
              </div>
              <div className="flex items-center gap-2">
                <FiZap className="w-4 h-4" />
                <span>AI-powered summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4" />
                <span>Trending topics</span>
              </div>
              {lastRefresh && (
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>Last refresh: {formatLastRefresh(lastRefresh)}</span>
                </div>
              )}
            </div>
          </motion.div>

          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-0"
            >
              <StatCard
                label="Total Articles"
                value={stats.totalArticles || 0}
                icon={FiBarChart2}
                color="text-primary"
                bgGradient="from-primary/20 to-purple-500/20"
                borderColor="border-primary/30"
              />
              <StatCard
                label="Articles Today"
                value={articlesToday}
                icon={FiCalendar}
                color="text-purple-400"
                bgGradient="from-purple-500/20 to-blue-500/20"
                borderColor="border-purple-500/30"
              />
              <StatCard
                label="News Sources"
                value={stats.uniqueSources || 0}
                icon={FiGlobe}
                color="text-blue-400"
                bgGradient="from-blue-500/20 to-cyan-500/20"
                borderColor="border-blue-500/30"
              />
              <StatCard
                label="Days Covered"
                value={stats.daysWithArticles || 0}
                icon={FiClock}
                color="text-cyan-400"
                bgGradient="from-cyan-500/20 to-teal-500/20"
                borderColor="border-cyan-500/30"
              />
            </motion.div>
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <FiTrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Top Stories</h2>
                </div>
                <Link
                  href="/articles"
                  className="text-sm text-primary hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  View All
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex-1 flex flex-col">
                {loading ? (
                  <div className="space-y-4 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-gray-800/50 rounded-xl border border-gray-700/30 animate-pulse" />
                    ))}
                  </div>
                ) : topStories.length > 0 ? (
                  <div className="space-y-4 flex-1">
                    {topStories.slice(0, 3).map((article, index) => (
                      <motion.div
                        key={article._id || article.url || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      >
                        <FeaturedArticleCardInner article={article} featured={index === 0} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center flex-1">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                      <FiTrendingUp className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400">No top stories available yet</p>
                    <p className="text-sm text-gray-500 mt-2">Check back soon for the latest FinTech news</p>
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <FiTarget className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Key Insights</h2>
              </div>

              <div className="flex-1 flex flex-col">
                {keyInsights ? (
                  <div className="space-y-4 flex-1">
                    <InsightCard
                      title="News Coverage"
                      description={`${keyInsights.totalArticles} articles from ${keyInsights.uniqueSources} sources covering ${keyInsights.coverage} days`}
                      icon={FiBarChart2}
                      color="text-primary"
                    />
                    <InsightCard
                      title="Today's Activity"
                      description={`${articlesToday} articles published today, keeping you up-to-date with the latest FinTech developments`}
                      icon={FiCalendar}
                      color="text-purple-400"
                    />
                    <InsightCard
                      title="Trending Now"
                      description={`${trendingTopics.length} topics are trending across FinTech news, indicating active industry movement`}
                      icon={FiTrendingUp}
                      color="text-blue-400"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
                    <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <FiTarget className="w-6 h-6 text-gray-500" />
                    </div>
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <FiTrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Trending Topics</h3>
              </div>

              <div className="flex-1 flex flex-col min-h-0 justify-center">
                {trendingTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5 justify-center items-center">
                    {trendingTopics.map((topic, index) => (
                      <motion.span
                        key={topic}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 text-sm font-medium text-white hover:border-primary/50 hover:from-primary/30 hover:to-purple-500/30 transition-all cursor-pointer whitespace-nowrap"
                      >
                        {topic}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                      <FiTrendingUp className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm">No trending topics yet</p>
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                  <FiBarChart2 className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Sentiment Overview</h3>
              </div>

              <div className="flex-1 flex flex-col min-h-0 justify-center">
                {sentimentData.total > 0 ? (
                  <div className="space-y-4">
                    <SentimentBar label="Positive" value={sentimentData.positive} total={sentimentData.total} color="green" />
                    <SentimentBar label="Neutral" value={sentimentData.neutral} total={sentimentData.total} color="gray" />
                    <SentimentBar label="Negative" value={sentimentData.negative} total={sentimentData.total} color="red" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <SentimentBar label="Positive" value={0} total={1} color="green" />
                    <SentimentBar label="Neutral" value={0} total={1} color="gray" />
                    <SentimentBar label="Negative" value={0} total={1} color="red" />
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-primary/30 flex-1 flex flex-col min-h-0 justify-center"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/40">
                  <FiEye className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Explore Deeper</h3>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  Dive into our complete article collection with advanced filters and search
                </p>
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-medium hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Browse All Articles
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.section>
          </div>
        </div>

        {articles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Recent Articles</h2>
              <Link
                href="/articles"
                className="text-sm text-primary hover:text-purple-400 transition-colors flex items-center gap-1"
              >
                View All
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((article, index) => (
                <motion.div
                  key={article._id || article.url || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.05 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

          <Footer />

          <FinTechChatBot articles={articles} />
        </main>
      </ChatBotProvider>
    </ErrorBoundary>
  );
}

function StatCard({ label, value, icon: Icon, color, bgGradient, borderColor }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${bgGradient} rounded-lg flex items-center justify-center border ${borderColor} transition-all duration-300 group-hover:scale-110`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-400">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{displayValue}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedArticleCardInner({ article, featured = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [summary, setSummary] = useState(article.summary || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  const { openChatWithArticle } = useChatBot();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleHover = async () => {
    setIsHovered(true);

    if (!summary && !isGenerating && !generationError) {
      setIsGenerating(true);
      setGenerationError(null);
      try {
        const response = await fetch("/api/articles/generate-summaries-simple", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maxArticles: 1,
            articleUrl: article.url
          }),
        });

        const responseText = await response.text();
        let responseData;
        try {
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          responseData = { error: responseText || "Invalid JSON response", parseError: e.message };
        }

        if (response.ok && responseData.success !== false) {
          if (responseData.summary) {
            setSummary(responseData.summary);
            setGenerationError(null);
            setIsGenerating(false);
            return;
          }

          let attempts = 0;
          const maxAttempts = 8;
          let pollDelay = 500;

          const pollForSummary = async () => {
            if (attempts >= maxAttempts) {
              setGenerationError("Summary generation timed out. Please try again.");
              setIsGenerating(false);
              return;
            }

            attempts++;
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);

              const articleResponse = await fetch(`/api/articles?limit=1000&url=${encodeURIComponent(article.url)}`, {
                signal: controller.signal
              });

              clearTimeout(timeoutId);

              if (articleResponse.ok) {
                const articles = await articleResponse.json();
                const updatedArticle = Array.isArray(articles)
                  ? articles.find(a => a.url === article.url)
                  : articles;

                if (updatedArticle && updatedArticle.summary) {
                  setSummary(updatedArticle.summary);
                  setGenerationError(null);
                  setIsGenerating(false);
                  return;
                }
              }

              pollDelay = Math.min(pollDelay * 2, 4000);
              setTimeout(pollForSummary, pollDelay);
            } catch (error) {
              if (attempts >= maxAttempts) {
                setGenerationError("Error checking for summary. Please try again.");
                setIsGenerating(false);
              } else {
                pollDelay = Math.min(pollDelay * 2, 4000);
                setTimeout(pollForSummary, pollDelay);
              }
            }
          };

          setTimeout(pollForSummary, pollDelay);
        } else {
          const errorMsg = responseData.error || responseData.details || "Failed to generate summary";
          const suggestion = responseData.suggestion || "Please check your GEMINI_API key in .env.local";
          setGenerationError(`${errorMsg} ${suggestion}`);
          setIsGenerating(false);
        }
      } catch (error) {
        console.error("Error generating summary:", error);
        setGenerationError("An unexpected error occurred during summary generation.");
        setIsGenerating(false);
      }
    }
  };

  const handleCheckoutToAI = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (openChatWithArticle) {
      openChatWithArticle(article);
    }
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleHover}
      onMouseLeave={() => setIsHovered(false)}
    >
      {openChatWithArticle && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCheckoutToAI}
          className="absolute bottom-3 right-3 z-20 w-10 h-10 bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center text-white border-2 border-white/20 backdrop-blur-sm transition-all duration-200"
          style={{
            boxShadow: "0 8px 16px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
          title="Analyze with AI"
        >
          <FiSearch className="w-5 h-5 drop-shadow-sm" />
        </motion.button>
      )}

      <div className={`bg-gray-900/30 rounded-xl border border-gray-700/30 overflow-hidden transition-all duration-300 ${
        isHovered ? 'border-primary/50' : ''
      }`}>
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.div
              key="original"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${featured ? 'flex-col md:flex-row' : 'flex-row'} gap-4 p-4`}
            >
              <Link
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                {featured && article.imageUrl && (
                  <div className="md:w-40 md:h-28 w-full h-40 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800/50 mb-4 md:mb-0">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 flex-wrap">
                    <span className="font-medium uppercase">{article.source}</span>
                    <span>•</span>
                    <span>{formatDate(article.date || article.publishedAt)}</span>
                    {featured && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-xs">Featured</span>
                      </>
                    )}
                  </div>
                  <h3 className={`font-semibold text-white group-hover:text-primary transition-colors mb-2 ${
                    featured ? 'text-lg line-clamp-2' : 'text-base line-clamp-2'
                  }`}>
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <span>Read more</span>
                    <FiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col p-4"
            >
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/25 to-purple-500/25 rounded-lg flex items-center justify-center border border-primary/40 flex-shrink-0">
                  <FiZap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider">AI Summary</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{article.source}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                <span>{formatDate(article.date || article.publishedAt)}</span>
                {featured && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-xs">Featured</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-[120px] py-2">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center w-full py-4"
                  >
                    <div className="relative w-12 h-12 mb-3">
                      <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-300">Generating AI summary...</p>
                    <p className="text-xs text-gray-500 mt-1">This will only take a moment</p>
                  </motion.div>
                ) : generationError ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center text-center text-red-400 text-sm w-full py-4"
                  >
                    <FiAlertCircle className="w-6 h-6 mb-2" />
                    <p className="px-2">{generationError}</p>
                  </motion.div>
                ) : summary ? (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3 w-full"
                  >
                    <h3 className={`font-semibold text-white leading-snug ${
                      featured ? 'text-lg' : 'text-base'
                    }`}>
                      {article.title}
                    </h3>
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    <p className={`text-gray-300 leading-relaxed ${
                      featured ? 'text-sm' : 'text-xs'
                    }`}>
                      {summary}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center w-full py-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center mb-3 border border-primary/20">
                      <FiZap className="w-6 h-6 text-primary/60" />
                    </div>
                    <p className="text-sm font-medium text-gray-300 mb-1">AI Summary</p>
                    <p className="text-xs text-gray-500 text-center">Hover to generate summary</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

              <div className="flex items-center gap-2 text-xs text-primary mt-2 flex-shrink-0">
                <Link
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-purple-400 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Read more</span>
                  <FiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InsightCard({ title, description, icon: Icon, color }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/30 border border-gray-700/30 hover:border-primary/30 transition-colors">
      <div className={`w-10 h-10 bg-gradient-to-br ${color === 'text-primary' ? 'from-primary/20 to-purple-500/20 border-primary/30' : color === 'text-purple-400' ? 'from-purple-500/20 to-blue-500/20 border-purple-500/30' : 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'} rounded-lg flex items-center justify-center border flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function SentimentBar({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorClasses = {
    green: "bg-green-500/20 border-green-500/30 text-green-400",
    gray: "bg-gray-500/20 border-gray-500/30 text-gray-400",
    red: "bg-red-500/20 border-red-500/30 text-red-400",
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${colorClasses[color]}`}>
            {value}
          </span>
          {total > 0 && (
            <span className="text-xs text-gray-500">
              {percentage}%
            </span>
          )}
        </div>
      </div>
      <div className="h-2.5 bg-gray-800/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          className={`h-full ${
            color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : color === 'red' ? 'bg-gradient-to-r from-red-500 to-rose-500'
            : 'bg-gradient-to-r from-gray-500 to-gray-400'
          } rounded-full shadow-sm`}
        />
      </div>
    </div>
  );
}
