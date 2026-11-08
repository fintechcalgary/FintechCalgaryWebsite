"use client";
import { linkAccent, linkUnderline } from "@/lib/uiClassNames";
import { ALERT_ERROR_CLASS, TOPIC_CHIP_CLASS } from "@/lib/uiTokens";

import { useState } from "react";
import {
  FiExternalLink,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiZap,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { PUBLIC_GLOW_CARD } from "@/components/layout/PublicPageFrame";
import { GlowCard } from "@/components/ui/spotlight-card";
import { formatDateShort } from "@/lib/dates";
import { extractReadableSource } from "@/lib/article-display";
import { ARTICLE_SENTIMENT } from "@/lib/articleSentiment";
import {
  API_ENDPOINTS,
  CONTENT_TYPES,
  HTTP_METHODS,
} from "@/lib/constants";

/**
 * ArticleCard Component
 * Displays an individual article within a digest
 */
export default function ArticleCard({ article, viewMode = "grid" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [currentSummary, setCurrentSummary] = useState(article.summary || null);

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case ARTICLE_SENTIMENT.POSITIVE:
        return <FiTrendingUp className="w-4 h-4 text-green-400" />;
      case ARTICLE_SENTIMENT.NEGATIVE:
        return <FiTrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <FiMinus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case ARTICLE_SENTIMENT.POSITIVE:
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case ARTICLE_SENTIMENT.NEGATIVE:
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleGenerateSummary = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGeneratingSummary || currentSummary || article.summary) return;

    setIsGeneratingSummary(true);
    setSummaryError(null);

    try {
      const response = await fetch(API_ENDPOINTS.ARTICLES_GENERATE_SUMMARIES, {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": CONTENT_TYPES.JSON },
        body: JSON.stringify({
          maxArticles: 1,
          articleUrl: article.url,
          article: {
            title: article.title,
            url: article.url,
            source: article.source,
            date: article.date,
            publishedAt: article.publishedAt,
          },
        }),
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = { error: responseText || "Invalid JSON response" };
      }

      if (response.ok && responseData.success !== false) {
        if (responseData.summary) {
          setCurrentSummary(responseData.summary);

          // Save the summary to the database
          try {
            await fetch(API_ENDPOINTS.ARTICLES, {
              method: HTTP_METHODS.PUT,
              headers: { "Content-Type": CONTENT_TYPES.JSON },
              body: JSON.stringify({
                url: article.url,
                summary: responseData.summary,
              }),
            });
          } catch (saveError) {
            console.error("Failed to save summary to database:", saveError);
            // Continue even if save fails - user still gets the summary
          }

          setIsGeneratingSummary(false);
          return;
        }

        let attempts = 0;
        const maxAttempts = 20;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const articleResponse = await fetch(
              `${API_ENDPOINTS.ARTICLES}?url=${encodeURIComponent(article.url)}`,
            );
            if (articleResponse.ok) {
              const articles = await articleResponse.json();
              const updatedArticle = Array.isArray(articles)
                ? articles.find((a) => a.url === article.url)
                : articles;
              if (updatedArticle && updatedArticle.summary) {
                setCurrentSummary(updatedArticle.summary);

                // Save the summary to the database if it's not already saved
                try {
                  await fetch("/api/articles", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      url: article.url,
                      summary: updatedArticle.summary,
                    }),
                  });
                } catch (saveError) {
                  console.error(
                    "Failed to save summary to database:",
                    saveError,
                  );
                  // Continue even if save fails - user still gets the summary
                }

                setIsGeneratingSummary(false);
                clearInterval(pollInterval);
              } else if (attempts >= maxAttempts) {
                setSummaryError(
                  "Summary generation timed out. Please try again.",
                );
                setIsGeneratingSummary(false);
                clearInterval(pollInterval);
              }
            }
          } catch {
            setSummaryError("Error checking for summary.");
            setIsGeneratingSummary(false);
            clearInterval(pollInterval);
          }
        }, 500);
      } else {
        setSummaryError(responseData.error || "Failed to generate summary");
        setIsGeneratingSummary(false);
      }
    } catch (error) {
      console.error("Summary generation error:", error);
      setSummaryError("An unexpected error occurred.");
      setIsGeneratingSummary(false);
    }
  };

  const displayDate =
    article.publishedAt ||
    (article.date ? `${article.date} ${article.time || ""}` : "");
  const displayTime = article.time || "";
  const isListView = viewMode === "list";
  const normalizedSummary = (() => {
    // Prioritize existing summaries in this order:
    // 1. Current summary (from live generation or updated state)
    // 2. Article's stored summary (from backend/database)
    // 3. Show pending message only if no summary exists anywhere
    const raw = (currentSummary || article.summary || "").trim();
    if (!raw) return "No summary available yet.";
    const words = raw.split(/\s+/);
    if (words.length <= 14) {
      return `${raw} Additional context will be included as updates are processed.`;
    }
    if (words.length > 42) {
      return `${words.slice(0, 42).join(" ")}...`;
    }
    return raw;
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <GlowCard
        customSize
        glowColor="purple"
        className={`group ${PUBLIC_GLOW_CARD} !p-0 ${
          isListView ? "flex flex-row" : ""
        }`}
      >
        <div
          className={`relative z-10 ${isListView ? "flex-1 flex flex-row gap-4 min-h-[198px]" : "min-h-[252px]"} p-5`}
        >
          {isListView && article.imageUrl && (
            <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote article URLs are arbitrary */}
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className={`flex-1 ${isListView ? "min-w-0" : ""}`}>
            <div
              className={`flex items-start justify-between ${isListView ? "mb-2" : "mb-3"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <p className="text-muted inline text-xs font-medium uppercase tracking-wide">
                    {extractReadableSource(article)}
                  </p>
                  <p className="text-muted inline text-xs">•</p>
                  {displayDate && (
                    <p className="text-muted inline text-xs">
                      {formatDateShort(displayDate)}
                    </p>
                  )}
                  {displayTime && (
                    <>
                      <p className="text-muted inline text-xs">•</p>
                      <p className="text-muted inline text-xs">{displayTime}</p>
                    </>
                  )}
                </div>
                <h4 className={`group-hover:text-primary transition-colors ${isListView ? "text-xl line-clamp-2" : "text-lg line-clamp-2"}`}>
                  {article.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {!currentSummary && !article.summary && (
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className={`p-2 rounded-lg transition-all ${
                      isGeneratingSummary
                        ? "bg-primary/30 text-primary cursor-wait"
                        : "text-gray-400 hover:text-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10"
                    }`}
                    title={
                      isGeneratingSummary
                        ? "Generating summary..."
                        : "Generate AI summary"
                    }
                    aria-label="Generate AI summary"
                  >
                    {isGeneratingSummary ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <FiZap className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <FiZap className="w-4 h-4" />
                    )}
                  </button>
                )}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-gray-700/50 transition-colors"
                  aria-label="Open article in new tab"
                >
                  <FiExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {!isListView && article.imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote article URLs are arbitrary */}
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div
              className={isListView ? "mb-2 min-h-[44px]" : "mb-2 min-h-[48px]"}
            >
              {summaryError ? (
                <div className={ALERT_ERROR_CLASS}>{summaryError}</div>
              ) : isGeneratingSummary ? (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <FiZap className="w-4 h-4" />
                  </motion.div>
                  <span>Generating AI summary...</span>
                </div>
              ) : (
                <>
                  <p className={`${isExpanded ? "" : isListView ? "line-clamp-2" : "line-clamp-4"}`}>
                    {normalizedSummary}
                  </p>
                  {normalizedSummary && normalizedSummary.length > 170 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className={`${linkAccent} mt-2 text-xs`.trim()}
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </>
              )}
            </div>

            <div
              className={`flex items-center justify-between pt-2 border-t border-gray-700/30 ${
                isListView ? "flex-wrap gap-2" : ""
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {article.categories
                  ?.slice(0, isListView ? 5 : 3)
                  .map((category, index) => (
                    <span key={index} className={`${TOPIC_CHIP_CLASS} !cursor-default`.trim()}>
                      {category}
                    </span>
                  ))}
                {article.categories?.length > (isListView ? 5 : 3) && (
                  <p className="text-muted inline px-2 py-1 rounded-md text-xs">
                    +{article.categories.length - (isListView ? 5 : 3)} more
                  </p>
                )}
              </div>

              {article.sentiment && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${getSentimentColor(article.sentiment)}`}
                >
                  {getSentimentIcon(article.sentiment)}
                  <span className="capitalize">{article.sentiment}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
}
