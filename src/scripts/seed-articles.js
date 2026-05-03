/**
 * seed-articles.js
 *
 * Clears articles / weekly_digests / refresh_logs and fetches fresh
 * articles from Google News RSS, generates Gemini AI summaries for
 * every article, then builds the weekly digest (top 15 by relevance).
 *
 * Usage:
 *   node --env-file=.env.local src/scripts/seed-articles.js
 */

import { MongoClient } from "mongodb";

// ── Config ──────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API;
const DB_NAME = "fintech-website";

const RSS_FEEDS = [
  "https://news.google.com/rss/search?q=fintech&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=cryptocurrency+bitcoin+ethereum&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=digital+banking+payments&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=AI+artificial+intelligence+finance&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=fintech+startup+funding+venture&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=blockchain+defi+web3&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=stripe+paypal+visa+mastercard&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=fintech+regulation+compliance&hl=en-US&gl=US&ceid=US:en",
];

// ── RSS Parser ───────────────────────────────────────────────────────
function extractXmlTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function extractXmlAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function stripCdata(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function cleanTitle(title) {
  // Google News appends " - Source Name" to titles; strip it
  const parts = title.split(" - ");
  if (parts.length >= 2) return parts.slice(0, -1).join(" - ").trim();
  return title.trim();
}

function parseSource(itemXml, rawTitle) {
  // Prefer <source> tag
  const sourceTag = extractXmlTag(itemXml, "source");
  if (sourceTag && sourceTag.trim()) return sourceTag.trim();
  // Fall back to last segment of title after " - "
  const parts = rawTitle.split(" - ");
  if (parts.length >= 2) return parts[parts.length - 1].trim();
  return "Google News";
}

function parseDate(pubDate) {
  if (!pubDate) return { date: null, time: null };
  try {
    const d = new Date(pubDate);
    return {
      date: d.toISOString().split("T")[0],
      time: d.toTimeString().slice(0, 5),
    };
  } catch {
    return { date: null, time: null };
  }
}

async function fetchRssFeed(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FintechCalgary/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const rawTitle = stripCdata(extractXmlTag(itemXml, "title"));
      const link = stripCdata(extractXmlTag(itemXml, "link")) || extractXmlAttr(itemXml, "link", "href");
      const pubDate = stripCdata(extractXmlTag(itemXml, "pubDate"));
      const { date, time } = parseDate(pubDate);

      if (!rawTitle || !link) continue;

      items.push({
        title: cleanTitle(rawTitle),
        url: link,
        source: parseSource(itemXml, rawTitle),
        date,
        time,
        summary: null,
        categories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return items;
  } catch (err) {
    console.warn(`  ⚠  RSS fetch failed for ${url}: ${err.message}`);
    return [];
  }
}

// ── Gemini Summary ───────────────────────────────────────────────────
async function generateSummary(article) {
  if (!GEMINI_API_KEY) return null;
  const prompt = [
    "You are a financial news analyst. Generate a concise, factual 2-3 sentence summary for this fintech article.",
    `Title: ${article.title}`,
    `Source: ${article.source}`,
    `Date: ${article.date || ""}`,
    "Keep it under 120 words. Do not use bullet points or markdown.",
    "Summary:",
  ].join("\n");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("").trim() || "";
    const cleaned = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^Summary:\s*/i, "").trim();
    return cleaned.length >= 20 ? (cleaned.length > 500 ? cleaned.slice(0, 500) + "…" : cleaned) : null;
  } catch (err) {
    console.warn(`    ⚠ Gemini failed for "${article.title.slice(0, 50)}": ${err.message}`);
    return null;
  }
}

// ── Ranking (mirrors weeklyDigest.js) ────────────────────────────────
const PRIORITY_KEYWORDS = [
  "funding", "acquisition", "regulation", "partnership", "launch", "ai", "payments",
  "banking", "crypto", "compliance", "fraud", "open banking", "fintech",
];
const MAJOR_COMPANY_KEYWORDS = [
  "visa", "mastercard", "paypal", "stripe", "block", "square", "revolut", "wise",
  "coinbase", "robinhood", "jpmorgan", "goldman sachs", "hsbc", "barclays",
  "american express", "fidelity", "blackrock", "tether",
];
const TIER_ONE_SOURCES = ["ft.com", "bloomberg", "reuters", "wsj", "cnbc", "techcrunch", "forbes"];
const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with","by",
  "from","as","is","was","are","were","be","been","has","have","had","do",
  "does","did","will","would","could","should","may","might","over","about",
  "after","its","their","this","that","these","those","into","than","more",
  "new","says","said","warns","warning","latest",
]);

function countHits(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);
}

function titleKeywords(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

// Remove near-duplicates: keep only the highest-ranked article per story cluster.
// Two articles are "same story" if they share ≥3 significant title keywords.
function deduplicateByStory(ranked) {
  const kept = [];
  const usedStoryKeys = new Set();
  for (const article of ranked) {
    const kws = [...new Set(titleKeywords(article.title))].slice(0, 6);
    let isSameStory = false;
    for (const existingStr of usedStoryKeys) {
      const existing = new Set(existingStr.split("|"));
      if (kws.filter((k) => existing.has(k)).length >= 3) { isSameStory = true; break; }
    }
    if (!isSameStory) {
      kept.push(article);
      usedStoryKeys.add(kws.sort().join("|"));
    }
  }
  return kept;
}

function rankArticles(articles) {
  const scored = articles
    .map((a) => {
      const text = `${a.title} ${a.summary || ""} ${a.source}`;
      const kwScore = countHits(text, PRIORITY_KEYWORDS) * 10;
      const coScore = countHits(text, MAJOR_COMPANY_KEYWORDS) * 12;
      const srcScore = TIER_ONE_SOURCES.some((s) => (a.source || "").toLowerCase().includes(s)) ? 3 : 0;
      const sumScore = a.summary && a.summary.trim().length > 20 ? 2 : 0;
      const pubDate = new Date(a.date || a.createdAt || 0);
      const recency = pubDate.getTime();
      const ageDays = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
      const agePenalty = ageDays > 90 ? -50 : ageDays > 30 ? -20 : 0;
      return { article: a, score: kwScore + coScore + srcScore + sumScore + agePenalty, recency };
    })
    .sort((a, b) => b.score !== a.score ? b.score - a.score : b.recency - a.recency)
    .map((e) => e.article);
  return deduplicateByStory(scored);
}

// ── Weekly Digest Builder ────────────────────────────────────────────
function getWeekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function buildDigest(articles) {
  const topicKeywords = [
    "fintech", "banking", "crypto", "blockchain", "payments", "ai", "investment",
    "regulation", "compliance", "security", "startup", "funding",
  ];
  const posKw = ["growth", "rise", "gain", "funding", "partnership", "launch", "success"];
  const negKw = ["decline", "loss", "fraud", "breach", "lawsuit", "risk", "fall"];

  const topics = {};
  let positive = 0, negative = 0, neutral = 0;

  for (const a of articles) {
    const text = `${a.title || ""} ${a.summary || ""}`.toLowerCase();
    for (const kw of topicKeywords) {
      if (text.includes(kw)) topics[kw] = (topics[kw] || 0) + 1;
    }
    const pos = countHits(text, posKw);
    const neg = countHits(text, negKw);
    if (pos > neg && pos > 0) positive++;
    else if (neg > pos && neg > 0) negative++;
    else neutral++;
  }

  return {
    stats: {
      topics: Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([topic, count]) => ({ topic, count })),
      sentiment: { positive, negative, neutral, total: articles.length },
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  if (!MONGODB_URI) {
    console.error("✗ MONGODB_URI not set. Run with: node --env-file=.env.local src/scripts/seed-articles.js");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  // ── Step 1: Clear collections ──────────────────────────────────────
  console.log("\n🗑  Clearing collections...");
  const [delArticles, delDigests, delLogs] = await Promise.all([
    db.collection("articles").deleteMany({}),
    db.collection("weekly_digests").deleteMany({}),
    db.collection("refresh_logs").deleteMany({}),
  ]);
  console.log(`   articles:       ${delArticles.deletedCount} deleted`);
  console.log(`   weekly_digests: ${delDigests.deletedCount} deleted`);
  console.log(`   refresh_logs:   ${delLogs.deletedCount} deleted`);

  // ── Step 2: Fetch RSS ──────────────────────────────────────────────
  console.log("\n📡  Fetching RSS feeds...");
  const allItems = [];
  for (const url of RSS_FEEDS) {
    const items = await fetchRssFeed(url);
    console.log(`   ${items.length} articles ← ${url.split("q=")[1]?.split("&")[0] || url}`);
    allItems.push(...items);
  }

  // Deduplicate by URL
  const seen = new Set();
  const unique = allItems.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
  console.log(`\n   ${unique.length} unique articles after dedup`);

  if (unique.length === 0) {
    console.error("✗ No articles fetched. Check network/RSS feeds.");
    await client.close();
    process.exit(1);
  }

  // ── Step 3: Insert all articles (no summaries yet) ─────────────────
  console.log("\n💾  Inserting articles into MongoDB...");
  await db.collection("articles").insertMany(unique, { ordered: false }).catch(() => {});
  const totalInserted = await db.collection("articles").countDocuments();
  console.log(`   ${totalInserted} articles in DB`);

  // ── Step 4: Pre-rank to find which 15 will be in digest ───────────
  console.log("\n🏆  Ranking articles to identify digest candidates...");
  const ranked = rankArticles(unique);
  const digestCandidates = ranked.slice(0, 15);
  console.log(`   Top 15 identified. Generating AI summaries for them...`);

  // ── Step 5: Generate summaries for the top 15 ─────────────────────
  if (!GEMINI_API_KEY) {
    console.warn("   ⚠ GEMINI_API not set — skipping summaries");
  } else {
    let generated = 0;
    for (let i = 0; i < digestCandidates.length; i++) {
      const a = digestCandidates[i];
      process.stdout.write(`   [${i + 1}/15] Summarizing: "${a.title.slice(0, 55)}..." `);
      const summary = await generateSummary(a);
      if (summary) {
        await db.collection("articles").updateOne({ url: a.url }, { $set: { summary, updatedAt: new Date() } });
        digestCandidates[i] = { ...a, summary };
        generated++;
        process.stdout.write("✓\n");
      } else {
        process.stdout.write("✗ (skipped)\n");
      }
      // Small delay to avoid Gemini rate limits
      await new Promise((r) => setTimeout(r, 300));
    }
    console.log(`\n   ${generated}/15 summaries generated`);
  }

  // ── Step 6: Build and save weekly digest ──────────────────────────
  console.log("\n📋  Building weekly digest...");
  // Re-rank with summaries included
  const rankedWithSummaries = rankArticles(digestCandidates);
  const top15 = rankedWithSummaries.slice(0, 15);
  const { stats } = buildDigest(top15);

  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  await db.collection("weekly_digests").createIndex({ weekStart: 1 }, { unique: true }).catch(() => {});
  await db.collection("weekly_digests").updateOne(
    { weekStart },
    {
      $set: {
        weekStart,
        weekEnd,
        status: "published",
        articleUrls: top15.map((a) => a.url).filter(Boolean),
        articleCount: top15.length,
        stats,
        generatedAt: new Date(),
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  // Log the refresh
  await db.collection("refresh_logs").insertOne({
    timestamp: new Date(),
    articlesImported: totalInserted,
    summariesGenerated: digestCandidates.filter((a) => a.summary).length,
    digestArticles: top15.length,
    duration: Date.now(),
    source: "seed-articles.js",
  });

  // ── Step 7: Print results ──────────────────────────────────────────
  console.log("\n✅  Digest built. Final top 15:\n");
  top15.forEach((a, i) => {
    const hasSummary = a.summary && a.summary.trim().length > 20;
    console.log(`  ${String(i + 1).padStart(2, "0")}. [${hasSummary ? "✓ summary" : "✗ no summary"}] ${a.title.slice(0, 80)}`);
    console.log(`      Source: ${a.source}  |  Date: ${a.date}`);
    if (hasSummary) console.log(`      → ${a.summary.slice(0, 100)}...`);
    console.log();
  });

  console.log(`📊  Sentiment:  +${stats.sentiment.positive} positive  ~${stats.sentiment.neutral} neutral  -${stats.sentiment.negative} negative`);
  console.log(`🏷   Topics:    ${stats.topics.map((t) => t.topic).join(", ")}`);
  console.log(`\n🌐  Total articles in DB: ${totalInserted}`);
  console.log(`📰  Digest articles:      ${top15.length} / 15`);
  console.log("\nDone. Start the dev server and visit /insights to test.\n");

  await client.close();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
