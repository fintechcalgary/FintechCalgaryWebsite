import { describe, it, expect } from "vitest";
import {
  ARTICLE_SENTIMENT,
  summarizeSentimentCounts,
} from "@/lib/articleSentiment";

describe("articleSentiment", () => {
  it("counts sentiment values on articles", () => {
    const articles = [
      { sentiment: ARTICLE_SENTIMENT.POSITIVE },
      { sentiment: ARTICLE_SENTIMENT.NEGATIVE },
      { sentiment: ARTICLE_SENTIMENT.NEUTRAL },
      { sentiment: ARTICLE_SENTIMENT.POSITIVE },
    ];
    expect(summarizeSentimentCounts(articles)).toEqual({
      positive: 2,
      negative: 1,
      neutral: 1,
    });
  });
});
