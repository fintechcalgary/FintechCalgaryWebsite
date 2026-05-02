"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import ArticleCard from "@/components/digest/ArticleCard";
import {
  FiSearch,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiTrendingUp,
  FiGrid,
  FiList,
  FiClock,
  FiZap,
  FiArrowLeft,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [sources, setSources] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date_desc");
  const [quickFilter, setQuickFilter] = useState("");

  useEffect(() => {
    document.title = "Finance News Articles | FinTech Calgary";
    fetchArticles();
  }, []);

  useEffect(() => {
    if (quickFilter) {
      const today = new Date();
      let startDate = new Date();
      switch (quickFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(today.getMonth() - 1);
          break;
      }
      setSelectedDate(startDate.toISOString().split("T")[0]);
      fetchArticles();
    }
  }, [quickFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedSource) params.append("source", selectedSource);
      params.append("limit", "100");
      params.append("sortBy", sortBy);
      const response = await fetch(`/api/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSources([...new Set(data.map((a) => a.source))].sort());
        setArticles(data);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedDate("");
    setSelectedSource("");
    setQuickFilter("");
    fetchArticles();
  };

  return (
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <section className="relative overflow-hidden pt-28 pb-8">
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
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500">
              Finance News Articles
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Browse and search the latest FinTech articles from Insights
            </p>
          </motion.div>

          {/* Search and controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 sticky top-24 z-40 bg-gray-900/80 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50"
          >
            <div className="flex flex-col md:flex-row gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${viewMode === "grid" ? "bg-primary text-white" : "text-gray-400 hover:text-white"}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${viewMode === "list" ? "bg-primary text-white" : "text-gray-400 hover:text-white"}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${showFilters ? "bg-primary/20 border-primary text-primary" : "bg-gray-800/50 border-gray-700/50 text-white hover:border-primary/50"}`}
              >
                <FiFilter className="w-5 h-5" />
                Filters
              </button>
              <button
                onClick={fetchArticles}
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-lg disabled:opacity-50"
              >
                <FiRefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { id: "today", label: "Today", icon: FiClock },
                { id: "week", label: "This week", icon: FiCalendar },
                { id: "month", label: "This month", icon: FiTrendingUp },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setQuickFilter(quickFilter === id ? "" : id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${quickFilter === id ? "bg-primary/20 border-primary text-primary" : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:border-primary/50"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30 flex flex-wrap gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        onBlur={fetchArticles}
                        className="px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/25"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Source</label>
                      <select
                        value={selectedSource}
                        onChange={(e) => {
                          setSelectedSource(e.target.value);
                          fetchArticles();
                        }}
                        className="px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/25 min-w-[160px]"
                      >
                        <option value="">All sources</option>
                        {sources.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    {(selectedDate || selectedSource || quickFilter) && (
                      <button
                        onClick={clearAllFilters}
                        className="self-end text-sm text-primary hover:text-purple-400"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {!loading && (
            <p className="text-gray-400 text-sm mb-4">
              Showing {filteredArticles.length} of {articles.length} articles
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-6 py-6 max-w-7xl flex-1">
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
                <FiSearch className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  {searchQuery || selectedDate || selectedSource
                    ? "No articles match your filters."
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

      <Footer />
    </main>
  );
}
