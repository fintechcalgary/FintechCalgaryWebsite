"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PublicPageShell from "@/components/layout/PublicPageShell";
import ArticleCard from "@/features/insights/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import {
  FiCalendar,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiArrowLeft,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { LoadingState } from "@/components/ui/Spinner";
import { PUBLIC_TITLE_SIZE } from "@/components/layout/PublicPageFrame";
import { PageTitle } from "@/components/ui/SectionHeading";

const ARCHIVE_PAGE_SIZES = [12, 24, 48];

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [weeklyDigestArticles, setWeeklyDigestArticles] = useState([]);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [archivePage, setArchivePage] = useState(1);
  const [archivePageSize, setArchivePageSize] = useState(24);
  const [archiveTotalPages, setArchiveTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date_desc");
  const [scope, setScope] = useState("week");

  const fetchWeekly = useCallback(async () => {
    try {
      const weeklyResponse = await fetch("/api/insights/current");
      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json();
        setWeeklyDigestArticles(
          Array.isArray(weeklyData?.articles) ? weeklyData.articles : [],
        );
      }
    } catch (error) {
      console.error("Failed to fetch weekly digest:", error);
    }
  }, []);

  const fetchArchivePage = useCallback(
    async (page) => {
      try {
        const archiveResponse = await fetch(
          `/api/articles?weeklyRole=digest&sortBy=${sortBy}&page=${page}&pageSize=${archivePageSize}`,
        );
        if (archiveResponse.ok) {
          const data = await archiveResponse.json();
          if (data && Array.isArray(data.items)) {
            setArticles(data.items);
            setArchiveTotal(data.total ?? 0);
            setArchiveTotalPages(data.totalPages ?? 1);
          } else {
            setArticles([]);
            setArchiveTotal(0);
            setArchiveTotalPages(1);
          }
        }
      } catch (error) {
        console.error("Failed to fetch archive articles:", error);
      }
    },
    [sortBy, archivePageSize],
  );

  const loadArticles = useCallback(async () => {
    setLoading(true);
    await fetchWeekly();
    if (scope === "all") {
      await fetchArchivePage(archivePage);
    }
    setLoading(false);
  }, [fetchWeekly, fetchArchivePage, scope, archivePage]);

  useEffect(() => {
    document.title = "Finance News Articles | FinTech Calgary";
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      await fetchWeekly();
      if (scope === "all") {
        await fetchArchivePage(archivePage);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchWeekly, fetchArchivePage, scope, archivePage]);

  const handleScopeChange = (nextScope) => {
    setScope(nextScope);
    if (nextScope === "all") {
      setArchivePage(1);
    }
  };

  const filteredArticles =
    scope === "week" ? weeklyDigestArticles : articles;

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const aDate = new Date(a.date || a.publishedAt || 0);
    const bDate = new Date(b.date || b.publishedAt || 0);
    return sortBy === "date_asc" ? aDate - bDate : bDate - aDate;
  });

  const articlesByDate = sortedArticles.reduce((acc, article) => {
    const date =
      article.date ||
      (article.publishedAt && article.publishedAt.split("T")[0]) ||
      "";
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
    if (dateString === yesterday.toISOString().split("T")[0])
      return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const showingFrom =
    scope === "all" && archiveTotal > 0
      ? (archivePage - 1) * archivePageSize + 1
      : 0;
  const showingTo =
    scope === "all"
      ? Math.min(archivePage * archivePageSize, archiveTotal)
      : filteredArticles.length;

  const handleArchivePageChange = (next) => {
    setArchivePage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleArchivePageSizeChange = (size) => {
    setArchivePageSize(size);
    setArchivePage(1);
  };

  const archivePager =
    scope === "all" && archiveTotal > 0 ? (
      <Pagination
        className="mt-10"
        page={archivePage}
        totalPages={archiveTotalPages}
        pageSize={archivePageSize}
        pageSizeOptions={ARCHIVE_PAGE_SIZES}
        onPageSizeChange={handleArchivePageSizeChange}
        disabled={loading}
        onPageChange={handleArchivePageChange}
      />
    ) : null;

  return (
    <PublicPageShell title="Finance News Articles | FinTech Calgary">
      <section className="relative overflow-hidden pt-36 pb-3">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href="/insights"
              className="fc-link inline-flex items-center gap-2"
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
            <PageTitle sizeClass={PUBLIC_TITLE_SIZE}>
              Finance News Articles
            </PageTitle>
            <p className="fc-lede mx-auto max-w-3xl">
              Browse weekly highlights or the full FinTech archive
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 sticky top-24 z-40 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_35%),linear-gradient(155deg,rgba(8,8,10,0.98),rgba(18,18,22,0.96)_45%,rgba(10,10,12,0.98))] backdrop-blur-xl rounded-2xl p-5 border border-zinc-600/45 shadow-2xl shadow-black/65"
          >
            <div className="grid grid-cols-1 xl:grid-cols-[auto_auto_1fr_auto] gap-4 items-stretch xl:items-end">
              <div className="space-y-2">
                <p className="text-[11px] tracking-[0.14em] fc-muted font-semibold">
                  Scope
                </p>
                <div className="flex items-center gap-2 bg-gray-800/60 rounded-xl p-1 border border-gray-700/60">
                  <button
                    type="button"
                    onClick={() => handleScopeChange("week")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${scope === "week" ? "bg-gradient-to-r from-primary to-purple-500/80 text-white shadow-lg shadow-primary/10" : "text-gray-300 hover:text-white"}`}
                  >
                    This Week
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScopeChange("all")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${scope === "all" ? "bg-gradient-to-r from-primary to-purple-500/80 text-white shadow-lg shadow-primary/10" : "text-gray-300 hover:text-white"}`}
                  >
                    Full Archive
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] tracking-[0.14em] fc-muted font-semibold">
                  Layout
                </p>
                <div className="flex items-center gap-2 bg-gray-800/60 rounded-xl p-1 border border-gray-700/60">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-white" : "text-gray-400 hover:text-white"}`}
                    aria-label="Grid view"
                  >
                    <FiGrid className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-primary text-white" : "text-gray-400 hover:text-white"}`}
                    aria-label="List view"
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] tracking-[0.14em] fc-muted font-semibold">
                  Sort Order
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    if (scope === "all") setArchivePage(1);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/25 min-w-[280px]"
                >
                  <option value="date_desc">Newest to Oldest</option>
                  <option value="date_asc">Oldest to Newest</option>
                </select>
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => void loadArticles()}
                  disabled={loading}
                  className="fc-btn-gradient-primary !px-4 !py-3 disabled:opacity-50"
                  aria-label="Refresh articles"
                >
                  <FiRefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {!loading && (
            <p className="fc-muted mb-1">
              {scope === "week" ? (
                <>
                  Showing {filteredArticles.length} of{" "}
                  {weeklyDigestArticles.length || 15} articles this week
                </>
              ) : archiveTotal > 0 ? (
                <>
                  Showing {showingFrom}–{showingTo} of {archiveTotal} articles in
                  the archive
                </>
              ) : (
                "No articles in the archive"
              )}
            </p>
          )}
        </div>
      </section>

      <div className="container relative z-10 mx-auto flex-1 px-6 pb-24 pt-1 sm:px-8 lg:px-12">
        {loading && <LoadingState size="lg" />}

        {!loading && (
          <>
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <FiCalendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="fc-body mb-4">
                  {scope === "week"
                    ? "No weekly digest available yet. Trigger Monday refresh to generate the weekly top 15."
                    : "No articles yet. Refresh from Insights or run article refresh."}
                </p>
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-2 fc-link"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back to Insights
                </Link>
              </div>
            ) : viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedArticles.map((article, index) => (
                    <motion.div
                      key={article._id || article.url || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.45) }}
                    >
                      <ArticleCard article={article} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </div>
                {archivePager}
              </>
            ) : (
              <>
                <div className="space-y-8">
                  {Object.entries(articlesByDate).map(([date, dateArticles]) => (
                    <div key={date}>
                      <h2 className="fc-title mb-4 border-b border-gray-700/50 pb-2 text-xl">
                        {formatDate(date)}
                      </h2>
                      <div className="space-y-4">
                        {dateArticles.map((article, index) => (
                          <motion.div
                            key={article._id || article.url || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: Math.min(index * 0.02, 0.3),
                            }}
                          >
                            <ArticleCard
                              article={article}
                              viewMode={viewMode}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {archivePager}
              </>
            )}
          </>
        )}
      </div>
    </PublicPageShell>
  );
}
