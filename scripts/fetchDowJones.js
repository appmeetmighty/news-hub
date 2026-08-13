const axios = require("axios");
const fs = require("fs-extra");

const API_KEY = process.env.SCRAPPA_API_KEY;

const LIVE_URL =
  "https://scrappa.co/api/google-finance/indices?indices=INDEXDJX:.DJI";

const HISTORY_URL =
  "https://scrappa.co/api/google-finance/historical?symbol=.DJI&exchange=INDEXDJX&range=8";

const OUTPUT_DIR = "./output/market";

async function fetchLive() {
  console.log("📈 Fetching Dow Jones live data...");

  if (!API_KEY) {
    throw new Error("SCRAPPA_API_KEY is not set");
  }

  const response = await axios.get(LIVE_URL, {
    headers: {
      "X-API-KEY": API_KEY,
    },
    timeout: 15000,
  });

  const index = response.data?.indices?.[0];

  if (!index) {
    throw new Error("Dow Jones data not found in Scrappa response");
  }

  const output = {
    updated_at: new Date().toISOString(),

    symbol: index.symbol,
    name: index.name,
    exchange: index.exchange,
    full_symbol: index.full_symbol,

    currency: index.currency,

    price: index.current_price,

    change: index.price_change,

    percent_change: index.percent_change,

    previous_close: index.previous_close,

    price_movement: index.price_movement,
  };

  await fs.ensureDir(OUTPUT_DIR);

  await fs.writeJson(
    `${OUTPUT_DIR}/dow_jones.json`,
    output,
    { spaces: 2 }
  );

  console.log("✅ Dow Jones live data saved");
  console.log(`💰 Price: ${output.price}`);
  console.log(`📊 Change: ${output.change}`);
  console.log(`📈 Change %: ${output.percent_change}%`);
}

async function fetchHistory() {
  console.log("📊 Fetching Dow Jones historical data...");

  if (!API_KEY) {
    throw new Error("SCRAPPA_API_KEY is not set");
  }

  const response = await axios.get(HISTORY_URL, {
    headers: {
      "X-API-KEY": API_KEY,
    },
    timeout: 30000,
  });

  const data = response.data;

  if (!data || !Array.isArray(data.prices)) {
    throw new Error("Historical Dow Jones prices not found");
  }

  const output = {
    updated_at: new Date().toISOString(),

    symbol: data.symbol,
    exchange: data.exchange,
    currency: data.currency,

    previous_close: data.previous_close,

    total: data.prices.length,

    prices: data.prices,
  };

  await fs.ensureDir(OUTPUT_DIR);

  await fs.writeJson(
    `${OUTPUT_DIR}/dow_jones_history.json`,
    output,
    { spaces: 2 }
  );

  console.log("✅ Dow Jones historical data saved");
  console.log(`📊 Historical records: ${data.prices.length}`);
}

async function main() {
  try {
    const mode = process.argv[2] || "live";

    if (mode === "live") {
      await fetchLive();
      return;
    }

    if (mode === "history") {
      await fetchHistory();
      return;
    }

    if (mode === "all") {
      await fetchLive();
      await fetchHistory();
      return;
    }

    console.log(`
Usage:

Live:
  node scripts/fetchDowJones.js live

History:
  node scripts/fetchDowJones.js history

Both:
  node scripts/fetchDowJones.js all
`);

    process.exit(1);
  } catch (error) {
    console.error("\n❌ Dow Jones update failed");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else {
      console.error(error.message);
    }

    process.exit(1);
  }
}

main();