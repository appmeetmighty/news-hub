const Parser = require("rss-parser");
const fs = require("fs-extra");
const crypto = require("crypto");

const sources = require("./rssSources");
const removeDuplicates = require("./duplicate");
const extractImage = require("./imageExtractor");
const writeJson = require("./writer");

const parser = new Parser({
  timeout: 15000,
});

async function fetchFeed(source) {
  try {
    console.log(`Fetching ${source.name}...`);

    const feed = await parser.parseURL(source.url);

    const articles = await Promise.all(
      feed.items.map(async (item) => {
        let image =
          item.enclosure?.url ||
          item["media:content"]?.url ||
          item["media:thumbnail"]?.url ||
          "";

        if (!image && item.link) {
          image = await extractImage(item.link);
        }

        return {
          id: crypto
            .createHash("md5")
            .update(item.link || item.guid || item.title || Math.random().toString())
            .digest("hex"),

          title: item.title || "",

          description: (item.contentSnippet || item.content || "")
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim(),

          url: item.link || "",

          image,

          source: source.name,

          category: source.category,

          published_at:
            item.pubDate ||
            item.isoDate ||
            new Date().toISOString(),
        };
      })
    );

    return articles;
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

  // Remove duplicate titles
  articles = removeDuplicates(articles);

  // Remove old articles (30 days)
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  articles = articles.filter((article) => {
    const date = new Date(article.published_at);
    return Date.now() - date.getTime() <= THIRTY_DAYS;
  });

  // Sort latest first
  articles.sort(
    (a, b) => new Date(b.published_at) - new Date(a.published_at)
  );

  const cryptoArticles = articles.filter(
    (item) => item.category === "crypto"
  );

  const stockArticles = articles.filter(
    (item) => item.category === "stocks"
  );

  const topArticles = articles.slice(0, 20);

  await fs.ensureDir("./output");

await writeJson("./output/latest.json", articles);
await writeJson("./output/crypto.json", cryptoArticles);
await writeJson("./output/stocks.json", stockArticles);
await writeJson("./output/top.json", topArticles);

  console.log("\n===========================");
  console.log(`✅ Total Articles : ${articles.length}`);
  console.log("✅ latest.json");
  console.log("✅ crypto.json");
  console.log("✅ stocks.json");
  console.log("✅ top.json");
  console.log("===========================");
}

main();