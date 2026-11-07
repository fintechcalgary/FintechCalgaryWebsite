"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import PublicPageShell from "@/components/layout/PublicPageShell";
import {
  PublicPageFrame,
  PublicPageHeader,
  PublicPageMetaDot,
  PublicPageMetaLine,
  PublicGlowCard,
  PUBLIC_SECTION_TITLE,
  PUBLIC_SECTION_TITLE_INLINE,
  PUBLIC_SECTION_TITLE_SM,
} from "@/components/layout/PublicPageFrame";
import FinTechChatBot from "@/features/insights/FinTechChatBot";
import WeeklyDigestModal from "@/features/insights/WeeklyDigestModal";
import ArticleDetailModal from "@/features/insights/ArticleDetailModal";
import DigestSnapshotStrip from "@/features/insights/DigestSnapshotStrip";
import FeaturedStoryCard from "@/features/insights/FeaturedStoryCard";
import InsightHighlightRow from "@/features/insights/InsightHighlightRow";
import { OverviewSentimentBar } from "@/features/insights/SentimentBars";
import { ChatBotProvider } from "@/contexts/ChatBotContext";
import ErrorBoundary from "@/components/providers/ErrorBoundary";
import Link from "next/link";
import { FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { LoadingState } from "@/components/ui/Spinner";
import { formatRelativeTime } from "@/lib/dates";
import {
  calculateArticleSentiment,
  deriveTrendingTopics,
} from "@/lib/article-display";

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

  const [digestOpen, setDigestOpen] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleReadMore = (e, article, summary = null) => {
    e.preventDefault();
    e.stopPropagation();
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

  const { data: refreshData } = useSWR("/api/articles/refresh", fetcher, {
    refreshInterval: 15 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    shouldRetryOnError: false,
  });

  const loading = articlesLoading || statsLoading;
  const articles = useMemo(
    () =>
      Array.isArray(weeklyDigestData?.articles)
        ? weeklyDigestData.articles
        : [],
    [weeklyDigestData],
  );
  const weeklyStats = weeklyDigestData?.stats || null;
  const lastRefresh = refreshData?.lastRefresh
    ? new Date(refreshData.lastRefresh)
    : null;

  const hasConnectionError =
    (articlesError || statsError) && !weeklyDigestData && !statsData;

  const totalArchiveArticles = statsData?.overall?.totalArticles || 0;
  const topStories = articles;
  const trendingTopics = useMemo(
    () => deriveTrendingTopics(articles),
    [articles],
  );

  const keyInsights = useMemo(() => {
    if (!statsData?.overall && !weeklyStats) return null;
    return {
      totalArticles: articles.length || 0,
      withSummaries:
        articles.filter((a) => a.summary && a.summary.trim()).length || 0,
      uniqueSources:
        new Set(articles.map((a) => a.source).filter(Boolean)).size || 0,
      coverage: 7,
      totalArchiveArticles,
    };
  }, [statsData?.overall, weeklyStats, articles, totalArchiveArticles]);

  const sentimentData = calculateArticleSentiment(
    topStories.length > 0 ? topStories : articles.slice(0, 10),
  );

  return (
    <PublicPageShell title="Insights | FinTech Calgary">
      <PublicPageFrame>
        {hasConnectionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fc-alert-warning mb-6"
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

        <PublicPageHeader
          lede="Weekly fintech news digests, top stories, and short article summaries we track for members"
          title="Insights"
        >
          <PublicPageMetaLine className="mt-6">
            Updated daily
            <PublicPageMetaDot />
            Short article summaries
            {lastRefresh && (
              <>
                <PublicPageMetaDot />
                Last refresh: {formatRelativeTime(lastRefresh)}
              </>
            )}
          </PublicPageMetaLine>

          {articles.length > 0 && (
            <div className="mt-8 w-full max-w-full px-1 sm:px-0">
              <button
                type="button"
                onClick={() => setDigestOpen(true)}
                className="fc-btn-soft group mx-auto flex w-full max-w-md flex-wrap items-center justify-center gap-x-2 gap-y-1 !px-4 !py-3 !text-sm !tracking-normal sm:w-auto sm:max-w-none sm:flex-nowrap sm:!px-5 sm:!py-2.5"
              >
                <span className="text-center leading-snug">
                  This Week&apos;s Full Digest
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums text-white/70">
                  <span
                    className="rounded-md border border-white/15 bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-white"
                    aria-label={`${articles.length} articles`}
                  >
                    {articles.length}
                  </span>
                  <FiArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </div>
          )}
        </PublicPageHeader>

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
              <PublicGlowCard>
                <div className="relative z-10 mb-4 flex items-center justify-between gap-4 sm:mb-5">
                  <h2 className={PUBLIC_SECTION_TITLE_INLINE}>
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
                          <FeaturedStoryCard
                            article={article}
                            featured={index === 0}
                            onReadMore={handleReadMore}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="fc-muted">No top stories available yet</p>
                      <p className="mt-2 fc-muted">
                        Check back soon for the latest FinTech news
                      </p>
                    </div>
                  )}
                </div>
              </PublicGlowCard>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <PublicGlowCard>
                <h2 className={PUBLIC_SECTION_TITLE}>Key Insights</h2>

                <div className="relative z-10">
                  {keyInsights ? (
                    <div className="space-y-2.5">
                      <InsightHighlightRow
                        title="News Coverage"
                        description={`${keyInsights.totalArticles} articles from ${keyInsights.uniqueSources} sources covering ${keyInsights.coverage} days`}
                      />
                      <InsightHighlightRow
                        title="Archive Growth"
                        description={`${keyInsights.totalArchiveArticles || totalArchiveArticles} total articles in archive, updated with each weekly digest release`}
                      />
                      <InsightHighlightRow
                        title="Trending Now"
                        description={`${trendingTopics.length} topics appearing most often in this week's coverage`}
                      />
                    </div>
                  ) : (
                    <LoadingState size="sm" className="py-6" />
                  )}
                </div>
              </PublicGlowCard>
            </motion.section>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-4">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <PublicGlowCard>
                <h3 className={PUBLIC_SECTION_TITLE_SM}>Trending Topics</h3>

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
                          className="fc-topic-chip"
                        >
                          {topic}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <p className="fc-muted">No trending topics yet</p>
                  )}
                </div>
              </PublicGlowCard>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <PublicGlowCard>
                <h3 className={PUBLIC_SECTION_TITLE_SM}>Sentiment Overview</h3>

                <div className="relative z-10 space-y-3">
                  <OverviewSentimentBar
                    label="Positive"
                    value={
                      sentimentData.total > 0 ? sentimentData.positive : 0
                    }
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
                    value={
                      sentimentData.total > 0 ? sentimentData.negative : 0
                    }
                    total={sentimentData.total > 0 ? sentimentData.total : 1}
                    color="red"
                  />
                </div>
              </PublicGlowCard>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <PublicGlowCard>
                <div className="relative z-10 text-center">
                  <h3 className={`${PUBLIC_SECTION_TITLE_SM} !mb-2`}>
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
              </PublicGlowCard>
            </motion.section>
          </div>
        </div>
      </PublicPageFrame>

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
