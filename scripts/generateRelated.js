const STOP_WORDS = new Set([
  "the","and","for","with","that","this","from","into","after",
  "over","under","about","their","there","would","could","should",
  "today","yesterday","very","good","says","said","new","its",
  "will","his","her","our","your","they","them","have","has"
]);

function generateRelated(articles) {
  const map = {};

  for (const article of articles) {
    const related = [];

    for (const other of articles) {
      if (article.id === other.id) continue;

      const articleEntities = article.entities || [];
      const otherEntities = other.entities || [];

      // Ignore generic topics for matching
      const ignoredTopics = [
        "ai",
        "crypto",
        "blockchain",
        "regulation",
        "defi",
        "web3"
      ];

      const articleStrong = articleEntities
        .filter(e => e.type !== "topic" || !ignoredTopics.includes(e.id))
        .map(e => e.id);

      const otherStrong = otherEntities
        .filter(e => e.type !== "topic" || !ignoredTopics.includes(e.id))
        .map(e => e.id);

      const shared = articleStrong.filter(id =>
        otherStrong.includes(id)
      );

      let score = 0;

      // Strong entity match (BTC, ETH, Apple, Tesla...)
      score += shared.length * 50;

      // Same category
      if (article.category === other.category) {
        score += 15;
      }

      // Same source
      if (article.source.id === other.source.id) {
        score += 10;
      }

      // Common words in title
      const words1 = article.title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w))

      const words2 = other.title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 3);

      const commonWords = words1.filter(w => words2.includes(w));

      score += commonWords.length * 10;

      if (score === 0) continue;

      related.push({
        score,

        article: {
          id: other.id,
          title: other.title,
          image: other.image,
          source: other.source,
          category: other.category,
          published_at: other.published_at,
          reading_time_minutes: other.reading_time_minutes,
          breaking_score: other.breaking_score,
          path: `articles/${other.id}.json`
        }
      });
    }

    related.sort((a, b) => b.score - a.score);

    let result = related
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.article);

    // Fallback: latest articles from same category
    if (result.length === 0) {
      result = articles
        .filter(a =>
          a.id !== article.id &&
          a.category === article.category
        )
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          title: a.title,
          image: a.image,
          source: a.source,
          category: a.category,
          published_at: a.published_at,
          reading_time_minutes: a.reading_time_minutes,
          breaking_score: a.breaking_score,
          path: `articles/${a.id}.json`
        }));
    }

    map[article.id] = result;
  }

  return map;
}

module.exports = generateRelated;