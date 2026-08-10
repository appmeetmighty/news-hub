const writeJson = require("./writer");

async function generateHome({
  latest,
  top,
  crypto,
  stocks,
  trending,
}) {
  // Only genuinely high-scoring articles qualify.
  const breaking = latest
    .filter((article) => (article.breaking_score || 0) >= 50)
    .sort((a, b) => {
      const scoreDiff =
        (b.breaking_score || 0) - (a.breaking_score || 0);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return (
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
      );
    })
    .slice(0, 10);

  await writeJson("./output/home.json", {
    hero: top[0] || null,

    breaking,

    latest: latest.slice(0, 20),

    crypto: crypto.slice(0, 10),

    stocks: stocks.slice(0, 10),

    trending: trending.topics.slice(0, 10),
  });

  console.log(
    `✅ home.json | Breaking: ${breaking.length}`
  );
}

module.exports = generateHome;
