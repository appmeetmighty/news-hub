const tickerMap = require("./tickerMap");
const topicMap = require("./topicMap");
const getIcon = require("./iconGenerator");

const cryptoSymbols = [
  "BTC",
  "ETH",
  "SOL",
  "XRP",
  "BNB",
  "DOGE",
];

const companySymbols = [
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "AMZN",
  "META",
  "GOOGL",
  "NFLX",
  "BLK",
  "MSTR",

  "GS",
  "JPM",
  "BAC",
  "C",
  "V",
  "MA",

  "AMD",
  "INTC",
  "TSM",
  "QCOM",

  "RIVN",
  "LCID",
  "NIO",

  "SPACEX",
  "RKLB",

  "OPENAI",
  "ANTHROPIC",
  "XAI",
  "GEMINI",
];

function extractEntities(title, description = "") {
  const text = `${title} ${description}`.toLowerCase();

  const entities = [];

  // -----------------------------
  // Companies / Crypto / Commodity
  // -----------------------------
  for (const [symbol, keywords] of Object.entries(tickerMap)) {
    const found = keywords.some((keyword) => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "i");
      return regex.test(text);
    });

    if (!found) continue;

    let type = "commodity";

    if (cryptoSymbols.includes(symbol)) {
      type = "crypto";
    } else if (companySymbols.includes(symbol)) {
      type = "company";
    }

    const entity = {
      id: symbol.toLowerCase(),
      symbol,
      name: keywords[0],
      type,
      path: `tickers/${symbol.toLowerCase()}.json`,
      icon: "",
    };

    entity.icon = getIcon(entity);

    entities.push(entity);
  }

  // -----------------------------
  // Topics
  // -----------------------------
  const topicNames = {
    crypto: "Crypto",
    blockchain: "Blockchain",
    defi: "DeFi",
    web3: "Web3",
    ai: "AI",
    nft: "NFT",
    etf: "ETF",
    stablecoin: "Stablecoin",
    mining: "Mining",
    regulation: "Regulation",
  };

  for (const [id, keywords] of Object.entries(topicMap)) {
    const found = keywords.some((word) => {
      const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, "i");
      return regex.test(text);
    });

    if (!found) continue;

    entities.push({
      id,
      name: topicNames[id] || id,
      type: "topic",
      icon: "",
    });
  }

  // -----------------------------
  // Remove duplicates
  // -----------------------------
  const unique = [];

  for (const entity of entities) {
    if (!unique.some((e) => e.id === entity.id)) {
      unique.push(entity);
    }
  }

  return {
    entities: unique,
  };
}

module.exports = extractEntities;
