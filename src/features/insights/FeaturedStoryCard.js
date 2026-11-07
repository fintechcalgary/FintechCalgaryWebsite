"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { useChatBot } from "@/contexts/ChatBotContext";
import { formatDateShort } from "@/lib/dates";
import {
  extractReadableSource,
  truncateWords,
} from "@/lib/article-display";

export default function FeaturedStoryCard({
  article,
  featured = false,
  onReadMore,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { openChatWithArticle } = useChatBot();
  const summary = article.summary || null;

  const handleCheckoutToAI = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openChatWithArticle?.(article);
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
          className={`flex gap-4 p-3.5 sm:p-4 ${
            featured ? "flex-col md:flex-row" : "flex-row"
          }`}
        >
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="mb-1 flex flex-wrap items-center gap-2 fc-muted text-xs">
              <span className="font-medium uppercase tracking-wide">
                {extractReadableSource(article)}
              </span>
              <span aria-hidden>•</span>
              <span>
                {formatDateShort(article.date || article.publishedAt)}
              </span>
              {featured && (
                <>
                  <span aria-hidden>•</span>
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
              type="button"
              onClick={(e) => onReadMore(e, article, summary)}
              className="fc-btn-read-more-subtle w-fit !text-xs"
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
                type="button"
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
