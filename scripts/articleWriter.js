const fs = require("fs-extra");
const path = require("path");

async function writeArticles(articles) {
  const folder = "./output/articles";

  await fs.ensureDir(folder);

  for (const article of articles) {
    await fs.writeJson(
      path.join(folder, `${article.id}.json`),
      article,
      { spaces: 2 }
    );
  }

  console.log(`✅ Generated ${articles.length} article files`);
}

module.exports = writeArticles;