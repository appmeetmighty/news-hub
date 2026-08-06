const Parser = require("rss-parser");
const fs = require("fs-extra");
const crypto = require("crypto");

const sources = require("./rssSources");
const removeDuplicates = require("./duplicate");
const extractImage = require("./imageExtractor");
const writeJson = require("./writer");
const extractEntities = require("./entityExtractor");
const generateTickerFiles = require("./generateTickerFiles");
const generateEntities = require("./generateEntities");
const getReadingTime = require("./readingTime");
const getBreakingScore = require("./breakingNews");
const generateRelated = require("./generateRelated");
const sourceMeta = require("./sourceMeta");
const writeArticles = require("./articleWriter");
const generateSourceFiles = require("./generateSourceFiles");
const generateTrending = require("./generateTrending");
const generateSearch = require("./generateSearch");
const generateHome = require("./generateHome");

const parser = new Parser({
  timeout: 15000,
});

function normalizeDate(item) {
  const value =
    item.isoDate ||
    item.pubDate ||
    new Date().toISOString();

  return new Date(value).toISOString();
}

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

  reading_time_minutes: getReadingTime(
  `${item.title || ""} ${item.contentSnippet || item.content || ""}`
),

  breaking_score: getBreakingScore({
  title: item.title || "",
  description: item.contentSnippet || item.content || "",
  published_at: normalizeDate(item),
}),

  url: item.link || "",

  image,

  source: sourceMeta[source.name] || {
  id: source.name.toLowerCase().replace(/\s+/g, "-"),
  name: source.name,
  website: "",
  icon: ""
},

  category: source.category,

  ...extractEntities(
    item.title || "",
    item.contentSnippet || item.content || ""
  ),

  published_at: normalizeDate(item),
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

  const relatedMap = generateRelated(articles);
  const withImages = articles.filter(
  (article) => article.image && article.image.trim() !== ""
).length;

console.log("\n===========================");
console.log(`🖼 Images Found : ${withImages}/${articles.length}`);
console.log(
  `📊 Coverage : ${((withImages / articles.length) * 100).toFixed(1)}%`
);
console.log("===========================\n");

  // const cryptoArticles = articles.filter(
  //   (item) => item.category === "crypto"
  // );

  // const stockArticles = articles.filter(
  //   (item) => item.category === "stocks"
  // );

  // const topArticles = articles.slice(0, 20);

  articles = articles.map(article => ({
    ...article,
    related: relatedMap[article.id] || []
}));

await writeArticles(articles);
const summaryArticles = articles.map(article => ({
  id: article.id,
  title: article.title,
  description: article.description,
  image: article.image,
  source: article.source,
  category: article.category,
  published_at: article.published_at,
  path: `articles/${article.id}.json`
}));

const cryptoSummary = summaryArticles.filter(
  article => article.category === "crypto"
);

const stockSummary = summaryArticles.filter(
  article => article.category === "stocks"
);

const topSummary = summaryArticles.slice(0, 20);

await fs.ensureDir("./output");

await writeJson("./output/latest.json", summaryArticles);
await writeJson("./output/crypto.json", cryptoSummary);
await writeJson("./output/stocks.json", stockSummary);
await writeJson("./output/top.json", topSummary);

await generateTickerFiles(articles);
await generateEntities(articles);
await generateSourceFiles(summaryArticles);
const trending = await generateTrending(articles);

await generateSearch(articles);

await generateHome({
  latest: summaryArticles,
  top: topSummary,
  crypto: cryptoSummary,
  stocks: stockSummary,
  trending
});

  console.log("\n===========================");
  console.log(`✅ Total Articles : ${articles.length}`);
  console.log("✅ latest.json");
  console.log("✅ crypto.json");
  console.log("✅ stocks.json");
  console.log("✅ top.json");
  console.log("✅ search.json");
  console.log("===========================");
}

main();
