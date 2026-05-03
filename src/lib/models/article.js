import { ObjectId } from "mongodb";

const ARTICLE_COLLECTION = "articles";

export async function createArticle(db, article) {
  return await db.collection(ARTICLE_COLLECTION).insertOne({
    ...article,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function createArticles(db, articles) {
  if (articles.length === 0) return { insertedCount: 0 };

  const articlesWithTimestamps = articles.map(article => ({
    ...article,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return await db.collection(ARTICLE_COLLECTION).insertMany(articlesWithTimestamps, {
    ordered: false,
  });
}

export async function getArticles(db, filters = {}) {
  try {
    const query = {};

    if (filters.date) {
      query.date = filters.date;
    }

    if (filters.source) {
      query.source = { $regex: filters.source, $options: "i" };
    }

    if (filters.url) {
      query.url = filters.url;
    }

    if (filters.hasSummary !== undefined) {
      if (filters.hasSummary) {
        query.summary = { $ne: null, $exists: true };
      } else {
        query.$or = [
          { summary: null },
          { summary: { $exists: false } }
        ];
      }
    }

    if (filters.weeklyRole) {
      query.weeklyRole = filters.weeklyRole;
    }

    const sortOptions = {};
    if (filters.sortBy === "date_asc") {
      sortOptions.date = 1;
      sortOptions.time = 1;
      sortOptions.createdAt = 1;
    } else {
      sortOptions.date = -1;
      sortOptions.time = -1;
      sortOptions.createdAt = -1;
    }

    const articles = await db
      .collection(ARTICLE_COLLECTION)
      .find(query)
      .sort(sortOptions)
      .limit(filters.limit || 100)
      .toArray();

    return articles;
  } catch (error) {
    console.error("Error in getArticles:", error);
    throw error;
  }
}

export async function getArticleByUrl(db, url) {
  return await db.collection(ARTICLE_COLLECTION).findOne({ url });
}

export async function updateArticle(db, articleId, updates) {
  return await db.collection(ARTICLE_COLLECTION).updateOne(
    { _id: new ObjectId(articleId) },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      }
    }
  );
}

export async function updateArticleSummary(db, url, summary) {
  return await db.collection(ARTICLE_COLLECTION).updateOne(
    { url },
    {
      $set: {
        summary,
        updatedAt: new Date(),
      }
    }
  );
}

export async function deleteArticle(db, articleId) {
  return await db.collection(ARTICLE_COLLECTION).deleteOne({ _id: new ObjectId(articleId) });
}

export async function getArticlesByDateRange(db, startDate, endDate) {
  return await db
    .collection(ARTICLE_COLLECTION)
    .find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
    .sort({ date: -1, time: -1 })
    .toArray();
}

export async function getArticleStats(db) {
  const pipeline = [
    {
      $group: {
        _id: "$date",
        count: { $sum: 1 },
        sources: { $addToSet: "$source" },
        withSummary: {
          $sum: {
            $cond: [{ $ne: ["$summary", null] }, 1, 0]
          }
        },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ];

  return await db.collection(ARTICLE_COLLECTION).aggregate(pipeline).toArray();
}

export async function getWeeklyDigestStats(db) {
  const pipeline = [
    {
      $group: {
        _id: "$digestWeekStart",
        count: { $sum: 1 },
        sources: { $addToSet: "$source" },
        withSummary: {
          $sum: {
            $cond: [{ $ne: ["$summary", null] }, 1, 0]
          }
        },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ];

  return await db.collection(ARTICLE_COLLECTION).aggregate(pipeline).toArray();
}
