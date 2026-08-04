const Parser = require("rss-parser");
const fs = require("fs-extra");
const sources = require("./rssSources");
const removeDuplicates = require("./duplicate");

const parser = new Parser({
  timeout: 15000,
});

async function fetchFeed(source) {
  try {
    console.log(`Fetching ${source.name}...`);

    const feed = await parser.parseURL(source.url);

    return feed.items.map((item) => ({
      title: item.title || "",
      description: item.contentSnippet || item.content || "",
      url: item.link || "",
      image:
  item.enclosure?.url ||
  item["media:content"]?.url ||
  item["media:thumbnail"]?.url ||
  "",
      source: source.name,
      category: source.category,
      published_at: item.pubDate || item.isoDate || new Date().toISOString(),
    }));
  } catch (e) {
    console.log(`❌ ${source.name} failed`);
    return [];
  }
}

async function main() {
  console.log("Fetching all RSS feeds...\n");

  const result = await Promise.all(
    sources.map((source) => fetchFeed(source))
  );


let articles = result.flat();

articles = removeDuplicates(articles);

// Keep only news from the last 30 days
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

articles = articles.filter(article => {
    const date = new Date(article.published_at);

    return Date.now() - date.getTime() <= THIRTY_DAYS;
});

  articles.sort((a, b) => {
    return new Date(b.published_at) - new Date(a.published_at);
  });

  await fs.ensureDir("./output");

  const cryptoArticles = articles.filter(
  (item) => item.category === "crypto"
);

const stockArticles = articles.filter(
  (item) => item.category === "stocks"
);

const topArticles = articles.slice(0, 20);
const updatedAt = new Date().toISOString();

await fs.writeJson(
  "./output/top.json",
  {
    updated_at: updatedAt,
    total: topArticles.length,
    articles: topArticles,
  },
  { spaces: 2 }
);

await fs.writeJson(
  "./output/crypto.json",
  {
    updated_at: updatedAt,
    total: cryptoArticles.length,
    articles: cryptoArticles,
  },
  { spaces: 2 }
);

await fs.writeJson(
  "./output/stocks.json",
  {
    updated_at: updatedAt,
    total: stockArticles.length,
    articles: stockArticles,
  },
  { spaces: 2 }
);

  console.log("\n===========================");
  console.log(`✅ Total Articles : ${articles.length}`);
  console.log("✅ Saved : output/latest.json");
  console.log("===========================");
}

main();