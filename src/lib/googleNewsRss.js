import {
  rankArticlesForWeeklyDigest,
  WEEKLY_ARTICLE_TOTAL_LIMIT,
  WEEKLY_DIGEST_ARTICLE_LIMIT,
} from "@/lib/models/weeklyDigest";

const GOOGLE_NEWS_RSS_FEEDS = [
  "fintech when:7d",
  "fintech startup funding when:7d",
  "digital banking payments when:7d",
  "open banking fintech when:7d",
  "fintech regulation compliance when:7d",
  "AI finance fintech when:7d",
  "blockchain crypto fintech when:7d",
  "visa mastercard stripe paypal payments when:7d",
].map((query) => {
  const encoded = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
});

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractXmlTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function cleanTitle(title) {
  const parts = (title || "").split(" - ").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return parts.slice(0, -1).join(" - ");
  return title || "";
}

function parseSource(itemXml, rawTitle) {
  const source = extractXmlTag(itemXml, "source");
  if (source) return source;

  const parts = (rawTitle || "").split(" - ").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  return "Google News";
}

function parsePublishedDate(pubDate) {
  const parsed = pubDate ? new Date(pubDate) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return {
    date: date.toISOString().split("T")[0],
    time: date.toTimeString().slice(0, 5),
    publishedAt: date,
  };
}

function normalizeComparableTitle(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .sort()
    .join(" ");
}

function uniqueByUrlAndTitle(articles) {
  const seenUrls = new Set();
  const seenTitles = new Set();

  return articles.filter((article) => {
    const urlKey = article.url || "";
    const titleKey = normalizeComparableTitle(article.title);
    if (!urlKey || seenUrls.has(urlKey) || seenTitles.has(titleKey)) return false;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    return true;
  });
}

export function isMongoConnectionError(error) {
  const message = error?.message || "";
  return message.includes("MONGODB_URI") ||
    message.includes("connect") ||
    message.includes("MongoServerSelectionError") ||
    message.includes("SSL routines") ||
    message.includes("tlsv1 alert") ||
    error?.code === "ECONNREFUSED";
}

export async function fetchGoogleNewsArticles(limit = WEEKLY_ARTICLE_TOTAL_LIMIT) {
  const fetched = [];

  const results = await Promise.allSettled(
    GOOGLE_NEWS_RSS_FEEDS.map(async (feedUrl) => {
      const response = await fetch(feedUrl, {
        headers: {
          "User-Agent": "FinTech Calgary Digest/1.0 (+https://fintechcalgary.ca)",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
        signal: AbortSignal.timeout(12000),
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`Google News RSS HTTP ${response.status}`);

      const xml = await response.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      const items = [];
      let match;

      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        const rawTitle = extractXmlTag(itemXml, "title");
        const url = extractXmlTag(itemXml, "link");
        const pubDate = extractXmlTag(itemXml, "pubDate");
        const parsedDate = parsePublishedDate(pubDate);

        if (!rawTitle || !url) continue;

        items.push({
          title: cleanTitle(rawTitle),
          url,
          source: parseSource(itemXml, rawTitle),
          date: parsedDate.date,
          time: parsedDate.time,
          publishedAt: parsedDate.publishedAt,
          summary: null,
          categories: [],
        });
      }
      return items;
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      fetched.push(...result.value);
    }
    // silently skip failed feeds so remaining articles still get returned
  }

  if (fetched.length === 0) {
    throw new Error("All Google News RSS feeds failed — no articles fetched");
  }

  return rankArticlesForWeeklyDigest(uniqueByUrlAndTitle(fetched)).slice(0, limit);
}

function countKeywordHits(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((score, keyword) => score + (lower.includes(keyword) ? 1 : 0), 0);
}

function getTopicSummary(articles) {
  const topicKeywords = [
    "fintech", "banking", "crypto", "blockchain", "payments", "ai", "investment",
    "regulation", "compliance", "security", "startup", "funding",
  ];

  const topics = {};
  for (const article of articles) {
    const text = `${article.title || ""} ${article.summary || ""}`.toLowerCase();
    for (const key of topicKeywords) {
      if (text.includes(key)) topics[key] = (topics[key] || 0) + 1;
    }
  }

  return Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));
}

function getSentimentSummary(articles) {
  const positiveKeywords = ["growth", "rise", "gain", "funding", "partnership", "launch", "success"];
  const negativeKeywords = ["decline", "loss", "fraud", "breach", "lawsuit", "risk", "fall"];

  let positive = 0;
  let negative = 0;
  let neutral = 0;

  for (const article of articles) {
    const text = `${article.title || ""} ${article.summary || ""}`.toLowerCase();
    const pos = countKeywordHits(text, positiveKeywords);
    const neg = countKeywordHits(text, negativeKeywords);

    if (pos > neg && pos > 0) positive += 1;
    else if (neg > pos && neg > 0) negative += 1;
    else neutral += 1;
  }

  return { positive, negative, neutral, total: articles.length };
}

export async function getLiveWeeklyDigest() {
  const articles = await fetchGoogleNewsArticles(WEEKLY_DIGEST_ARTICLE_LIMIT);
  const now = new Date();

  return {
    weekStart: null,
    weekEnd: null,
    generatedAt: now,
    stats: {
      topics: getTopicSummary(articles),
      sentiment: getSentimentSummary(articles),
    },
    articles,
    count: articles.length,
    source: "google-news-rss-fallback",
  };
}
