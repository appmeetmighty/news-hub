const fs = require("fs");
const path = require("path");

const home = JSON.parse(
  fs.readFileSync("./output/home.json", "utf8")
);

const articles = home.articles;

const lists = [
  ...articles.latest,
  ...articles.breaking,
  ...articles.crypto,
  ...articles.stocks,
];

let missing = [];

for (const article of lists) {
  const file = path.join("./output", article.path);

  if (!fs.existsSync(file)) {
    missing.push(article.path);
  }
}

if (missing.length) {
  console.log("\n❌ Missing article files:\n");

  missing.forEach((m) => console.log(m));

  process.exit(1);
}

console.log("✅ Validation Passed");