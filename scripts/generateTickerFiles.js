const fs = require("fs-extra");
const path = require("path");

async function generateTickerFiles(articles) {
  const groups = {};

  for (const article of articles) {
    if (!article.entities) continue;

    for (const entity of article.entities) {
      if (!groups[entity.id]) {
        groups[entity.id] = {
          id: entity.id,
          symbol: entity.symbol,
          name: entity.name,
          type: entity.type,
          articles: []
        };
      }

      groups[entity.id].articles.push({
  ...article,
  path: `articles/${article.id}.json`
});
    }
  }

  await fs.ensureDir("./output/tickers");

  for (const entity of Object.values(groups)) {
    await fs.writeJson(
      path.join("./output/tickers", `${entity.id}.json`),
      {
        updated_at: new Date().toISOString(),
        id: entity.id,
        symbol: entity.symbol,
        name: entity.name,
        type: entity.type,
        total: entity.articles.length,
        articles: entity.articles
      },
      { spaces: 2 }
    );
  }

  console.log(`✅ Generated ${Object.keys(groups).length} ticker files`);
}

module.exports = generateTickerFiles;
