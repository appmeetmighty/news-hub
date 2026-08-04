const fs = require("fs-extra");

async function writeJson(path, articles) {
  await fs.writeJson(
    path,
    {
      updated_at: new Date().toISOString(),
      total: articles.length,
      articles,
    },
    { spaces: 2 }
  );
}

module.exports = writeJson;