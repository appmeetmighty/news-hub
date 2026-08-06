// scripts/generateSearch.js

const writeJson = require("./writer");

async function generateSearch(articles) {
  const total = articles.length;

  await writeJson(
    "./output/search.json",
    articles.map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
      image: article.image,
      keywords: [
        ...(article.entities || []).flatMap(e => [
          e.id,
          e.name,
          e.symbol
        ]),

        article.source.id,
        article.source.name,

        article.category,

        ...article.title
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, "")
          .split(/\s+/)
      ]
        .filter(Boolean)
        .map(v => v.toString().toLowerCase())
        .filter(word => word.length > 2)
        .filter((v, i, arr) => arr.indexOf(v) === i),

      category: article.category,
      source: article.source,
      published_at: article.published_at,
      path: `articles/${article.id}.json`
    }))
  );

  console.log(`✅ search.json (${total})`);
}

module.exports = generateSearch;
