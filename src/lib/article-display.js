/**
 * Article display helpers for Insights, digest modals, and article cards.
 */

import { ARTICLE_SENTIMENT } from "@/lib/articleSentiment";

export const FINTECH_TOPIC_KEYWORDS = {
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

const POSITIVE_KEYWORDS = [
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

const NEGATIVE_KEYWORDS = [
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

function cleanDomain(value) {
  if (!value) return "";
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toUpperCase();
}

function normalizeTitleSource(title) {
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
}

/** Human-readable outlet name from RSS / Google News article fields. */
export function extractReadableSource(article) {
  const rawSource = (article?.source || "").trim();
  const rawUrl = (article?.url || "").trim();

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
  } catch {
    /* invalid URL */
  }

  const titleSource = normalizeTitleSource(article?.title);
  return titleSource || "UNKNOWN SOURCE";
}

export function truncateWords(text, maxWords = 42) {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}...`;
}

/**
 * @param {Array<{ title?: string, source?: string, categories?: string[] }>} articles
 * @param {number} [limit=10]
 */
export function deriveTrendingTopics(articles, limit = 10) {
  if (!Array.isArray(articles) || articles.length === 0) return [];

  const topicCounts = {};

  articles.forEach((article) => {
    const title = (article.title || "").toLowerCase();
    const source = (article.source || "").toLowerCase();
    const text = `${title} ${source}`;

    Object.entries(FINTECH_TOPIC_KEYWORDS).forEach(([keyword, displayName]) => {
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

  return Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([topic]) => topic);
}

/**
 * @param {Array<{ sentiment?: string, title?: string, summary?: string }>} articles
 */
export function calculateArticleSentiment(articles) {
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  if (!Array.isArray(articles)) {
    return { positive: 0, negative: 0, neutral: 0, total: 0 };
  }

  articles.forEach((article) => {
    if (article.sentiment) {
      const sentiment = article.sentiment.toLowerCase();
      if (sentiment === ARTICLE_SENTIMENT.POSITIVE) positive++;
      else if (sentiment === ARTICLE_SENTIMENT.NEGATIVE) negative++;
      else neutral++;
      return;
    }

    const title = (article.title || "").toLowerCase();
    const summary = (article.summary || "").toLowerCase();
    const text = `${title} ${summary}`;

    let positiveScore = 0;
    let negativeScore = 0;

    POSITIVE_KEYWORDS.forEach((keyword) => {
      if (text.includes(keyword)) positiveScore++;
    });

    NEGATIVE_KEYWORDS.forEach((keyword) => {
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
}
