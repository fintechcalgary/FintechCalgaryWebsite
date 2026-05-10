// Manual summary generation script for existing articles
const { connectToDatabase } = require('./src/lib/mongodb');
const { getArticles, updateArticleSummary } = require('./src/lib/models/article');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function generateSummaryWithGemini(article) {
  const prompt = [
    "Write a concise 2-3 sentence summary of this fintech news article for a professional audience.",
    "Focus on the key development, its significance, and potential impact on the industry.",
    "",
    `Title: ${article.title}`,
    `Source: ${article.source || "Unknown"}`,
    "",
    "Respond with only the summary text. No markdown, no asterisks, no bullet points.",
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Gemini request failed (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("").trim() || "";

  if (!text) return null;

  const cleaned = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^Summary:\s*/i, "").trim();
  if (cleaned.length < 20) return null;
  return cleaned.length > 500 ? `${cleaned.slice(0, 500)}...` : cleaned;
}

async function generateSummariesForArticles() {
  try {
    console.log('Connecting to database...');
    const db = await connectToDatabase();
    
    console.log('Fetching articles without summaries...');
    const articles = await getArticles(db, { 
      hasSummary: false, 
      limit: 15,
      sortBy: 'date_desc' 
    });

    if (articles.length === 0) {
      console.log('No articles without summaries found.');
      return;
    }

    console.log(`Found ${articles.length} articles to generate summaries for...`);

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] Generating summary for: ${article.title}`);
      
      try {
        const summary = await generateSummaryWithGemini(article);
        
        if (summary) {
          await updateArticleSummary(db, article.url, summary);
          console.log(`✓ Summary generated and saved: ${summary.substring(0, 100)}...`);
        } else {
          console.log('✗ Failed to generate summary (empty result)');
        }
      } catch (error) {
        console.error(`✗ Error generating summary for ${article.title}:`, error.message);
      }

      // Small delay between requests to avoid rate limiting
      if (i < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\nSummary generation completed!');
    
  } catch (error) {
    console.error('Fatal error in summary generation:', error);
  } finally {
    process.exit(0);
  }
}

// Check if API key is available
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not set!');
  console.error('Please set it in your .env.local file and try again.');
  process.exit(1);
}

generateSummariesForArticles();
