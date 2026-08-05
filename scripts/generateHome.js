const writeJson = require("./writer");

async function generateHome({
  latest,
  top,
  crypto,
  stocks,
  trending
}) {
  await writeJson("./output/home.json", {
    hero: top[0] || null,

    breaking: latest
      .filter(a => a.breaking_score >= 50)
      .slice(0, 10),

    latest: latest.slice(0, 20),

    crypto: crypto.slice(0, 10),

    stocks: stocks.slice(0, 10),

    trending: trending.topics.slice(0, 10)
  });

  console.log("✅ home.json");
}

module.exports = generateHome;