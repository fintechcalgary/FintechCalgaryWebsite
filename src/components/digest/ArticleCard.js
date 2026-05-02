"use client";

import { useState } from "react";
import { FiExternalLink, FiBookmark, FiTrendingUp, FiTrendingDown, FiMinus, FiZap } from "react-icons/fi";
import { motion } from "framer-motion";

/**
 * ArticleCard Component
 * Displays an individual article within a digest
 */
export default function ArticleCard({ article, onBookmark, viewMode = 'grid' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [currentSummary, setCurrentSummary] = useState(article.summary || null);

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <FiTrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <FiTrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <FiMinus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'negative':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  const handleGenerateSummary = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGeneratingSummary || article.summary) return;

    setIsGeneratingSummary(true);
    setSummaryError(null);

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
        responseData = { error: responseText || "Invalid JSON response" };
      }

      if (response.ok && responseData.success !== false) {
        let attempts = 0;
        const maxAttempts = 20;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const articleResponse = await fetch(`/api/articles?url=${encodeURIComponent(article.url)}`);
            if (articleResponse.ok) {
              const articles = await articleResponse.json();
              const updatedArticle = Array.isArray(articles) ? articles.find(a => a.url === article.url) : articles;
              if (updatedArticle && updatedArticle.summary) {
                setCurrentSummary(updatedArticle.summary);
                setIsGeneratingSummary(false);
                clearInterval(pollInterval);
              } else if (attempts >= maxAttempts) {
                setSummaryError("Summary generation timed out. Please try again.");
                setIsGeneratingSummary(false);
                clearInterval(pollInterval);
              }
            }
          } catch (error) {
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

  const displayDate = article.publishedAt || (article.date ? `${article.date} ${article.time || ''}` : '');
  const displayTime = article.time || '';
  const isListView = viewMode === 'list';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30 hover:border-primary/50 transition-all duration-300 overflow-hidden ${
        isListView ? 'flex flex-row' : ''
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className={`relative z-10 ${isListView ? 'flex-1 flex flex-row gap-4' : ''} p-5`}>
        {isListView && article.imageUrl && (
          <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className={`flex-1 ${isListView ? 'min-w-0' : ''}`}>
          <div className={`flex items-start justify-between ${isListView ? 'mb-2' : 'mb-3'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {article.source}
                </span>
                <span className="text-xs text-gray-500">•</span>
                {displayDate && (
                  <span className="text-xs text-gray-500">
                    {formatDate(displayDate)}
                  </span>
                )}
                {displayTime && (
                  <>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {displayTime}
                    </span>
                  </>
                )}
              </div>
              <h4 className={`font-semibold text-white group-hover:text-primary transition-colors ${
                isListView ? 'text-xl line-clamp-2' : 'text-lg line-clamp-2'
              }`}>
                {article.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {!currentSummary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className={`p-2 rounded-lg transition-all ${
                    isGeneratingSummary
                      ? 'bg-primary/30 text-primary cursor-wait'
                      : 'text-gray-400 hover:text-primary hover:bg-gradient-to-br hover:from-primary/20 hover:to-purple-600/20'
                  }`}
                  title={isGeneratingSummary ? 'Generating summary...' : 'Generate AI summary'}
                  aria-label="Generate AI summary"
                >
                  {isGeneratingSummary ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FiZap className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <FiZap className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setIsBookmarked(!isBookmarked);
                  onBookmark?.(article);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-400 hover:text-primary hover:bg-gray-700/50'
                }`}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              >
                <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-700/50 transition-colors"
                aria-label="Open article in new tab"
              >
                <FiExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {!isListView && article.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className={isListView ? 'mb-2' : 'mb-3'}>
            {summaryError ? (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                {summaryError}
              </div>
            ) : isGeneratingSummary ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FiZap className="w-4 h-4" />
                </motion.div>
                <span>Generating AI summary...</span>
              </div>
            ) : (
              <>
                <p className={`text-sm text-gray-300 leading-relaxed ${isExpanded ? '' : isListView ? 'line-clamp-2' : 'line-clamp-3'}`}>
                  {currentSummary || 'No summary available.'}
                </p>
                {currentSummary && currentSummary.length > 150 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-xs text-primary hover:text-purple-400 transition-colors"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </>
            )}
          </div>

          <div className={`flex items-center justify-between pt-3 border-t border-gray-700/30 ${
            isListView ? 'flex-wrap gap-2' : ''
          }`}>
            <div className="flex flex-wrap gap-2">
              {article.categories?.slice(0, isListView ? 5 : 3).map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-md text-xs bg-gray-700/50 text-gray-300 border border-gray-600/30 hover:border-primary/50 transition-colors"
                >
                  {category}
                </span>
              ))}
              {article.categories?.length > (isListView ? 5 : 3) && (
                <span className="px-2 py-1 rounded-md text-xs text-gray-500">
                  +{article.categories.length - (isListView ? 5 : 3)} more
                </span>
              )}
            </div>

            {article.sentiment && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${getSentimentColor(article.sentiment)}`}>
                {getSentimentIcon(article.sentiment)}
                <span className="capitalize">{article.sentiment}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
