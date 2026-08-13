require("dotenv").config();

const axios = require("axios");
const fs = require("fs-extra");

const API_KEY = process.env.SCRAPPA_API_KEY;

const LIVE_URL =
  "https://scrappa.co/api/google-finance/indices?indices=INDEXDJX:.DJI";

const HISTORY_URL =
  "https://scrappa.co/api/google-finance/historical?symbol=.DJI&exchange=INDEXDJX&range=8";

const OUTPUT_DIR = "./output/market";

const LIVE_OUTPUT_FILE = `${OUTPUT_DIR}/dow_jones.json`;

const HISTORY_OUTPUT_FILE =
  `${OUTPUT_DIR}/dow_jones_history.json`;

// ============================================================
// API KEY
// ============================================================

function checkApiKey() {
  if (!API_KEY) {
    throw new Error(
      "SCRAPPA_API_KEY is not set."
    );
  }
}

// ============================================================
// NEW YORK TIME
// ============================================================

function getNewYorkTime() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const values = {};

  for (const part of parts) {
    values[part.type] = part.value;
  }

  return {
    weekday: values.weekday,
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

// ============================================================
// MARKET OPEN CHECK
// ============================================================

function isMarketOpen() {
  const { weekday, hour, minute } = getNewYorkTime();

  if (weekday === "Sat" || weekday === "Sun") {
    return false;
  }

  const currentMinutes = hour * 60 + minute;

  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;

  return (
    currentMinutes >= marketOpen &&
    currentMinutes < marketClose
  );
}

// ============================================================
// READ EXISTING LIVE DATA
// ============================================================

async function readExistingLiveData() {
  try {
    if (!(await fs.pathExists(LIVE_OUTPUT_FILE))) {
      return null;
    }

    return await fs.readJson(LIVE_OUTPUT_FILE);
  } catch (error) {
    console.error(
      "⚠️ Could not read existing DJI data:",
      error.message
    );

    return null;
  }
}

// ============================================================
// FETCH LIVE DJI
// ============================================================

async function fetchLive() {
  console.log("📈 Checking Dow Jones market status...");

  const existingData = await readExistingLiveData();

  // ----------------------------------------------------------
  // MARKET CLOSED
  // ----------------------------------------------------------

  if (!isMarketOpen()) {
    console.log("⏸️ US market is closed.");
    console.log("🚫 Skipping Scrappa API request.");

    if (existingData) {
      console.log(
        `💰 Keeping last price: ${existingData.price}`
      );

      // Update only status information.
      // The actual price remains untouched.
      const closedData = {
        ...existingData,

        market_status: "closed",

        status_updated_at: new Date().toISOString(),
      };

      await fs.writeJson(
        LIVE_OUTPUT_FILE,
        closedData,
        {
          spaces: 2,
        }
      );

      console.log("✅ Last DJI price preserved.");
    } else {
      console.log(
        "ℹ️ No previous DJI data exists yet."
      );
    }

    return;
  }

  // ----------------------------------------------------------
  // MARKET OPEN
  // ----------------------------------------------------------

  console.log("🟢 US market is open.");
  console.log("📡 Fetching Dow Jones from Scrappa...");

  checkApiKey();

  try {
    const response = await axios.get(
      LIVE_URL,
      {
        headers: {
          "X-API-KEY": API_KEY,
        },
        timeout: 15000,
      }
    );

    const index = response.data?.indices?.[0];

    if (!index) {
      throw new Error(
        "Dow Jones data not found in Scrappa response."
      );
    }

    if (
      index.current_price === null ||
      index.current_price === undefined
    ) {
      throw new Error(
        "Scrappa returned an empty current price."
      );
    }

    const now = new Date().toISOString();

    const output = {
      updated_at: now,

      last_updated: now,

      market_status: "open",

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
      LIVE_OUTPUT_FILE,
      output,
      {
        spaces: 2,
      }
    );

    console.log("");
    console.log("✅ Dow Jones live data saved.");
    console.log(`💰 Price: ${output.price}`);
    console.log(`📊 Change: ${output.change}`);
    console.log(
      `📈 Change %: ${output.percent_change}%`
    );
    console.log(
      `📌 Previous close: ${output.previous_close}`
    );
    console.log(
      `📁 File: ${LIVE_OUTPUT_FILE}`
    );
    console.log("");
  } catch (error) {
    console.error("");
    console.error(
      "❌ Failed to fetch Dow Jones live data."
    );

    if (error.response) {
      console.error(
        "HTTP Status:",
        error.response.status
      );

      console.error(
        "API Response:",
        error.response.data
      );
    } else {
      console.error(
        "Error:",
        error.message
      );
    }

    // Important:
    // Existing JSON is NOT deleted or overwritten.
    console.log(
      "💾 Existing DJI data has been preserved."
    );

    throw error;
  }
}

// ============================================================
// FETCH HISTORICAL DJI
// ============================================================

async function fetchHistory() {
  console.log(
    "📊 Fetching Dow Jones historical data..."
  );

  checkApiKey();

  try {
    const response = await axios.get(
      HISTORY_URL,
      {
        headers: {
          "X-API-KEY": API_KEY,
        },
        timeout: 30000,
      }
    );

    const data = response.data;

    if (!data) {
      throw new Error(
        "Empty response received from Scrappa."
      );
    }

    if (!Array.isArray(data.prices)) {
      throw new Error(
        "Historical Dow Jones prices not found."
      );
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
      HISTORY_OUTPUT_FILE,
      output,
      {
        spaces: 2,
      }
    );

    console.log("");
    console.log(
      "✅ Dow Jones historical data saved."
    );

    console.log(
      `📊 Historical records: ${data.prices.length}`
    );

    console.log(
      `📁 File: ${HISTORY_OUTPUT_FILE}`
    );

    console.log("");
  } catch (error) {
    console.error("");
    console.error(
      "❌ Failed to fetch Dow Jones historical data."
    );

    if (error.response) {
      console.error(
        "HTTP Status:",
        error.response.status
      );

      console.error(
        "API Response:",
        error.response.data
      );
    } else {
      console.error(
        "Error:",
        error.message
      );
    }

    throw error;
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const mode = process.argv[2] || "live";

  try {
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

    console.log("");
    console.log("❌ Invalid command.");
    console.log("");

    console.log(
      "Live:"
    );

    console.log(
      "node scripts/fetchDowJones.js live"
    );

    console.log("");

    console.log(
      "History:"
    );

    console.log(
      "node scripts/fetchDowJones.js history"
    );

    console.log("");

    console.log(
      "Both:"
    );

    console.log(
      "node scripts/fetchDowJones.js all"
    );

    console.log("");

    process.exit(1);
  } catch (error) {
    console.error("");
    console.error(
      "❌ Dow Jones update failed:"
    );

    console.error(error.message);

    process.exit(1);
  }
}

main();
