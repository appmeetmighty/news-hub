const tickerMap = require("./tickerMap");
const topicMap = require("./topicMap");
const getIcon = require("./iconGenerator");

function extractEntities(title, description = "") {
  const text = `${title} ${description}`.toLowerCase();

  const entities = [];

  // -------- Tickers / Companies / Commodities --------
  for (const [symbol, keywords] of Object.entries(tickerMap)) {
    const aliases = keywords.slice(1);

if (!aliases.some(k => {
    const regex = new RegExp(`\\b${k.toLowerCase()}\\b`, "i");
    return regex.test(text);
})) {
    continue;
}

    let type = "commodity";

    if (["BTC", "ETH", "SOL", "XRP", "BNB", "DOGE"].includes(symbol)) {
      type = "crypto";
    } else if (
      ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "META", "GOOGL", "NFLX", "BLK", "MSTR"].includes(symbol)
    ) {
      type = "company";
    }

    const entity = {
      id: symbol.toLowerCase(),
      symbol,
      name: keywords[0],
      type,
      path: `tickers/${symbol.toLowerCase()}.json`,
    };

    entity.icon = getIcon(entity);

    entities.push(entity);
  }

  // -------- Topics --------
  for (const [id, keywords] of Object.entries(topicMap)) {
  if (!keywords.some(word => {
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, "i");
    return regex.test(text);
})) {
    continue;
}

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
    regulation: "Regulation"
};

entities.push({
    id,
    name: topicNames[id] || id,
    type: "topic"
});
  }

  return {
    entities
  };
}

module.exports = extractEntities;