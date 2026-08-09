"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PublicPageShell from "@/components/layout/PublicPageShell";
import ArticleCard from "@/features/insights/ArticleCard";
import {
  FiCalendar,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiArrowLeft,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [weeklyDigestArticles, setWeeklyDigestArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date_desc");
  const [scope, setScope] = useState("week");

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const [archiveResponse, weeklyResponse] = await Promise.all([
        fetch(`/api/articles?weeklyRole=digest&limit=500&sortBy=${sortBy}`),
        fetch("/api/insights/current"),
      ]);

      let archiveArticles = [];
      let weeklyArticles = [];

      if (archiveResponse.ok) {
        const data = await archiveResponse.json();
        archiveArticles = Array.isArray(data) ? data : [];
      }

      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json();
        weeklyArticles = Array.isArray(weeklyData?.articles) ? weeklyData.articles : [];
      }

      setArticles(archiveArticles);
      setWeeklyDigestArticles(weeklyArticles);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    document.title = "Finance News Articles | FinTech Calgary";
    fetchArticles();
  }, [fetchArticles]);

  const filteredArticles = scope === "week" ? weeklyDigestArticles : articles;

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const aDate = new Date(a.date || a.publishedAt || 0);
    const bDate = new Date(b.date || b.publishedAt || 0);
    return sortBy === "date_asc" ? aDate - bDate : bDate - aDate;
  });

  const articlesByDate = sortedArticles.reduce((acc, article) => {
    const date = article.date || (article.publishedAt && article.publishedAt.split("T")[0]) || "";
    if (!acc[date]) acc[date] = [];
    acc[date].push(article);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateString === today.toISOString().split("T")[0]) return "Today";
    if (dateString === yesterday.toISOString().split("T")[0]) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <PublicPageShell title="Finance News Articles | FinTech Calgary">

      <section className="relative overflow-hidden pt-36 pb-3">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Back to Insights - prominent */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-primary hover:text-purple-400 transition-colors font-medium"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Insights
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400/75">
              Finance News Articles
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Browse weekly highlights or the full FinTech archive
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 sticky top-24 z-40 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_35%),linear-gradient(155deg,rgba(8,8,10,0.98),rgba(18,18,22,0.96)_45%,rgba(10,10,12,0.98))] backdrop-blur-xl rounded-2xl p-5 border border-zinc-600/45 shadow-2xl shadow-black/65"
          >
            <div className="grid grid-cols-1 xl:grid-cols-[auto_auto_1fr_auto] gap-4 items-stretch xl:items-end">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Scope</p>
                <div className="flex items-center gap-2 bg-gray-800/60 rounded-xl p-1 border border-gray-700/60">
                  <button
                    onClick={() => setScope("week")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${scope === "week" ? "bg-gradient-to-r from-primary to-purple-500/80 text-white shadow-lg shadow-primary/10" : "text-gray-300 hover:text-white"}`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setScope("all")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${scope === "all" ? "bg-gradient-to-r from-primary to-purple-500/80 text-white shadow-lg shadow-primary/10" : "text-gray-300 hover:text-white"}`}
                  >
                    Full Archive
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Layout</p>
                <div className="flex items-center gap-2 bg-gray-800/60 rounded-xl p-1 border border-gray-700/60">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-white" : "text-gray-400 hover:text-white"}`}
                    aria-label="Grid view"
                  >
                    <FiGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-primary text-white" : "text-gray-400 hover:text-white"}`}
                    aria-label="List view"
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Sort Order</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/25 min-w-[280px]"
                >
                  <option value="date_desc">Newest to Oldest</option>
                  <option value="date_asc">Oldest to Newest</option>
                </select>
              </div>

              <div className="flex items-end justify-end">
                <button
                  onClick={fetchArticles}
                  disabled={loading}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500/80 text-white hover:shadow-lg hover:shadow-primary/15 disabled:opacity-50"
                  aria-label="Refresh articles"
                >
                  <FiRefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </motion.div>

          {!loading && (
            <p className="text-gray-400 text-sm mb-1">
              Showing {filteredArticles.length} of {scope === "week" ? 15 : articles.length} articles
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-6 pt-1 pb-6 max-w-7xl flex-1">
        {loading && (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-800/50 rounded-xl border border-gray-700/30 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <>
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <FiCalendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  {scope === "week"
                    ? "No weekly digest available yet. Trigger Monday refresh to generate the weekly top 15."
                    : "No articles yet. Refresh from Insights or run article refresh."}
                </p>
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-2 text-primary hover:text-purple-400"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back to Insights
                </Link>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedArticles.map((article, index) => (
                  <motion.div
                    key={article._id || article.url || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <ArticleCard article={article} viewMode={viewMode} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(articlesByDate).map(([date, dateArticles]) => (
                  <div key={date}>
                    <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700/50">
                      {formatDate(date)}
                    </h2>
                    <div className="space-y-4">
                      {dateArticles.map((article, index) => (
                        <motion.div
                          key={article._id || article.url || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                        >
                          <ArticleCard article={article} viewMode={viewMode} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PublicPageShell>
  );
}
