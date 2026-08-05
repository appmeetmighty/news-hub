const writeJson = require("./writer");

module.exports = async function generateTrending(articles) {
  const topics = new Map();

  for (const article of articles) {
    for (const entity of article.entities || []) {
      const key = entity.id;

      if (!topics.has(key)) {
        topics.set(key, {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          icon: entity.icon || "",
          count: 0,
          articles: [],
        });
      }

      const topic = topics.get(key);

      topic.count++;

      topic.articles.push({
        id: article.id,
        title: article.title,
        image: article.image,
        source: article.source,
        category: article.category,
        published_at: article.published_at,
        path: `articles/${article.id}.json`,
      });
    }
  }

  const trending = [...topics.values()]
    .sort((a, b) => b.count - a.count)
    .map((topic) => ({
      ...topic,
      articles: topic.articles
        .sort(
          (a, b) =>
            new Date(b.published_at) -
            new Date(a.published_at)
        )
        .slice(0, 10),
    }));

  const data = {
    generated_at: new Date().toISOString(),
    topics: trending,
  };

  await writeJson("./output/trending.json", data);

  console.log(`✅ trending.json (${trending.length} topics)`);

  return data;
};