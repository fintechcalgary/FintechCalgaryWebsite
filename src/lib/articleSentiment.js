/** Article / digest sentiment values stored on article records. */

export const ARTICLE_SENTIMENT = {
  POSITIVE: "positive",
  NEGATIVE: "negative",
  NEUTRAL: "neutral",
};

const { POSITIVE, NEGATIVE, NEUTRAL } = ARTICLE_SENTIMENT;

export function summarizeSentimentCounts(articles) {
  const counts = { positive: 0, negative: 0, neutral: 0 };
  for (const article of articles) {
    const sentiment = article?.sentiment;
    if (sentiment === POSITIVE) counts.positive++;
    else if (sentiment === NEGATIVE) counts.negative++;
    else counts.neutral++;
  }
  return counts;
}
