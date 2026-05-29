const WEEKLY_DIGEST_COLLECTION = "weekly_digests";

export const WEEKLY_DIGEST_ARTICLE_LIMIT = 15;
export const WEEKLY_ARTICLE_ARCHIVE_LIMIT = 15;
export const WEEKLY_ARTICLE_TOTAL_LIMIT = WEEKLY_DIGEST_ARTICLE_LIMIT + WEEKLY_ARTICLE_ARCHIVE_LIMIT;

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  // Use UTC methods so the result is identical on every server regardless of timezone.
  const day = d.getUTCDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat
  const diffToFriday = day >= 5 ? day - 5 : day + 2; // days since most-recent Friday
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() - diffToFriday
  ));
}

export async function ensureWeeklyDigestIndexes(db) {
  await db.collection(WEEKLY_DIGEST_COLLECTION).createIndex({ weekStart: 1 }, { unique: true });
  await db.collection(WEEKLY_DIGEST_COLLECTION).createIndex({ status: 1, weekStart: -1 });
}

function countKeywordHits(text, keywords) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    if (lower.includes(keyword)) score += 1;
  }
  return score;
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with","by",
  "from","as","is","was","are","were","be","been","has","have","had","do",
  "does","did","will","would","could","should","may","might","over","about",
  "after","its","their","this","that","these","those","into","than","more",
  "new","says","said","warns","warning","latest",
  "report","reports","news","update","updates","could","just",
]);

function titleKeywords(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

function normalizeComparableText(text) {
  return (text || "")
    .toLowerCase()
    .replace(/&amp;/g, " and ")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .join(" ");
}

function titleSimilarity(a, b) {
  const aWords = new Set(normalizeComparableText(a).split(" ").filter(Boolean));
  const bWords = new Set(normalizeComparableText(b).split(" ").filter(Boolean));
  if (!aWords.size || !bWords.size) return 0;
  const intersection = [...aWords].filter((word) => bWords.has(word)).length;
  const union = new Set([...aWords, ...bWords]).size;
  return intersection / union;
}

function canonicalArticleUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const param of [...parsed.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_cid|mc_eid|igshid)/i.test(param)) {
        parsed.searchParams.delete(param);
      }
    }
    return parsed.toString();
  } catch {
    return url || "";
  }
}

// Remove near-duplicate articles that cover the same story.
function deduplicateByStory(ranked) {
  const kept = [];
  const keptKeywordSets = [];
  const keptUrls = new Set();

  for (const article of ranked) {
    const canonicalUrl = canonicalArticleUrl(article.url);
    if (canonicalUrl && keptUrls.has(canonicalUrl)) continue;

    const kws = new Set(titleKeywords(article.title));
    let isSameStory = false;
    for (const { keywords, title } of keptKeywordSets) {
      const overlap = [...kws].filter((k) => keywords.has(k)).length;
      if (overlap >= 3 || titleSimilarity(article.title, title) >= 0.58) {
        isSameStory = true;
        break;
      }
    }
    if (!isSameStory) {
      kept.push(article);
      keptKeywordSets.push({ keywords: kws, title: article.title || "" });
      if (canonicalUrl) keptUrls.add(canonicalUrl);
    }
  }
  return kept;
}

export function rankArticlesForWeeklyDigest(articles) {
  const priorityKeywords = [
    "funding", "acquisition", "regulation", "partnership", "launch", "ai", "payments",
    "banking", "crypto", "compliance", "fraud", "open banking", "fintech",
  ];
  const majorCompanyKeywords = [
    "visa", "mastercard", "paypal", "stripe", "block", "square", "revolut", "wise",
    "coinbase", "robinhood", "jpmorgan", "goldman sachs", "hsbc", "barclays",
    "american express", "nasdaq", "nyse", "fidelity", "blackrock", "tether",
  ];
  const tierOneSources = ["ft.com", "bloomberg", "reuters", "wsj", "cnbc", "techcrunch", "forbes"];

  const ranked = articles
    .map((article) => {
      const title = article.title || "";
      const summary = article.summary || "";
      const source = article.source || "";
      const text = `${title} ${summary} ${source}`;
      const keywordScore = countKeywordHits(text, priorityKeywords);
      const majorCompanyScore = countKeywordHits(text, majorCompanyKeywords);
      const sourceScore = tierOneSources.some((s) => source.toLowerCase().includes(s)) ? 3 : 0;
      const summaryScore = summary && summary.trim().length > 20 ? 2 : 0;
      const pubDate = new Date(article.date || article.publishedAt || article.createdAt || 0);
      const recency = pubDate.getTime() || 0;

      // Penalize articles older than 30 days so old news never crowds out fresh stories
      const ageMs = Date.now() - pubDate.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const agePenalty = ageDays > 90 ? -50 : ageDays > 30 ? -20 : 0;

      return {
        article,
        score: keywordScore * 10 + majorCompanyScore * 12 + sourceScore + summaryScore + agePenalty,
        recency,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.recency - a.recency;
    })
    .map((entry) => entry.article);

  // Remove near-duplicate stories, keeping the highest-ranked version of each
  return deduplicateByStory(ranked);
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

export async function createOrUpdateWeeklyDigest(db, options = {}) {
  const weekStart = options.weekStart || getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekArticles = await db
    .collection("articles")
    .find({
      $or: [
        {
          date: {
            $gte: weekStart.toISOString().split("T")[0],
            $lt: weekEnd.toISOString().split("T")[0],
          },
        },
        {
          createdAt: {
            $gte: weekStart,
            $lt: weekEnd,
          },
        },
      ],
    })
    .sort({ date: -1, time: -1, createdAt: -1 })
    .limit(250)
    .toArray();

  let ranked = rankArticlesForWeeklyDigest(weekArticles);

  const topArticles = ranked.slice(0, WEEKLY_DIGEST_ARTICLE_LIMIT);
  const articleUrls = topArticles.map((article) => article.url).filter(Boolean);

  const digestDoc = {
    weekStart,
    weekEnd,
    status: options.status || "published",
    articleUrls,
    articleCount: articleUrls.length,
    stats: {
      topics: getTopicSummary(topArticles),
      sentiment: getSentimentSummary(topArticles),
    },
    generatedAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection(WEEKLY_DIGEST_COLLECTION).updateOne(
    { weekStart },
    {
      $set: digestDoc,
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  return { digest: digestDoc, topArticles };
}

export async function getCurrentWeeklyDigest(db) {
  const weekStart = getWeekStart(new Date());
  const digest = await db.collection(WEEKLY_DIGEST_COLLECTION).findOne(
    { weekStart, status: "published" },
    { sort: { generatedAt: -1 } }
  );

  return getWeeklyDigestArticles(db, digest);
}

export async function getLatestPublishedWeeklyDigest(db) {
  const digest = await db.collection(WEEKLY_DIGEST_COLLECTION).findOne(
    { status: "published" },
    { sort: { weekStart: -1, generatedAt: -1 } }
  );

  return getWeeklyDigestArticles(db, digest);
}

async function getWeeklyDigestArticles(db, digest) {
  if (!digest || !digest.articleUrls?.length) {
    return null;
  }

  const articles = await db
    .collection("articles")
    .find({ url: { $in: digest.articleUrls } })
    .toArray();

  const byUrl = new Map(articles.map((article) => [article.url, article]));
  const orderedArticles = digest.articleUrls
    .map((url) => byUrl.get(url))
    .filter(Boolean)
    .slice(0, WEEKLY_DIGEST_ARTICLE_LIMIT);

  return {
    ...digest,
    articles: orderedArticles,
  };
}
