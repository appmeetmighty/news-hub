const fs = require("fs-extra");

async function generateSourceFiles(articles) {
  const outputDir = "./output/sources";

  await fs.ensureDir(outputDir);

  const groups = {};

  for (const article of articles) {
    const sourceId = article.source.id;

    if (!groups[sourceId]) {
      groups[sourceId] = {
        id: article.source.id,
        name: article.source.name,
        website: article.source.website,
        icon: article.source.icon,
        articles: []
      };
    }

    groups[sourceId].articles.push({
      id: article.id,
      title: article.title,
      description: article.description,
      image: article.image,
      category: article.category,
      published_at: article.published_at,
      path: `articles/${article.id}.json`
    });
  }

  for (const source of Object.values(groups)) {
    await fs.writeJson(
      `${outputDir}/${source.id}.json`,
      source,
      { spaces: 2 }
    );
  }

  console.log(`✅ Generated ${Object.keys(groups).length} source files`);
}

module.exports = generateSourceFiles;