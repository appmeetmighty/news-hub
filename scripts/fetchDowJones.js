require("dotenv").config();

const axios = require("axios");
const fs = require("fs-extra");

// ============================================================
// CONFIG
// ============================================================

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
// CHECK API KEY
// ============================================================

function checkApiKey() {
  if (!API_KEY) {
    throw new Error(
      "SCRAPPA_API_KEY is not set. Please configure your environment variable."
    );
  }
}


// ============================================================
// GET NEW YORK TIME
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
// CHECK MARKET OPEN
// ============================================================

function isMarketOpen() {
  const { weekday, hour, minute } = getNewYorkTime();

  // Saturday / Sunday
  if (weekday === "Sat" || weekday === "Sun") {
    return false;
  }

  const currentMinutes = hour * 60 + minute;

  // Regular NYSE session
  // 9:30 AM - 4:00 PM New York time
  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;

  return (
    currentMinutes >= marketOpen &&
    currentMinutes < marketClose
  );
}


// ============================================================
// FETCH LIVE DJI
// ============================================================

async function fetchLive() {
  console.log("==========================================");
  console.log("📈 DOW JONES LIVE UPDATE");
  console.log("==========================================");

  const nyTime = getNewYorkTime();

  console.log(
    `🕒 New York time: ${nyTime.weekday} ${String(nyTime.hour).padStart(2, "0")}:${String(nyTime.minute).padStart(2, "0")}`
  );

  // ----------------------------------------------------------
  // MARKET HOURS PROTECTION
  // ----------------------------------------------------------

  if (!isMarketOpen()) {
    console.log("⏸️ US market is currently closed.");
    console.log("🚫 Scrappa API request skipped.");
    console.log("💰 No API credit consumed.");

    return;
  }

  console.log("🟢 US market is open.");
  console.log("📡 Fetching Dow Jones from Scrappa...");

  checkApiKey();

  try {
    const response = await axios.get(LIVE_URL, {
      headers: {
        "X-API-KEY": API_KEY,
      },
      timeout: 15000,
    });

    const index = response.data?.indices?.[0];

    if (!index) {
      throw new Error(
        "Dow Jones data was not found in Scrappa response."
      );
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
      LIVE_OUTPUT_FILE,
      output,
      {
        spaces: 2,
      }
    );

    console.log("");
    console.log("✅ Dow Jones live data saved.");
    console.log("");
    console.log(`💰 Price: ${output.price}`);
    console.log(`📊 Change: ${output.change}`);
    console.log(`📈 Change %: ${output.percent_change}%`);
    console.log(`📌 Previous close: ${output.previous_close}`);
    console.log("");
    console.log(`📁 File: ${LIVE_OUTPUT_FILE}`);
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ Failed to fetch Dow Jones live data.");

    if (error.response) {
      console.error("HTTP Status:", error.response.status);
      console.error("API Response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }

    throw error;
  }
}


// ============================================================
// FETCH HISTORICAL DJI
// ============================================================

async function fetchHistory() {
  console.log("==========================================");
  console.log("📊 DOW JONES HISTORICAL UPDATE");
  console.log("==========================================");

  checkApiKey();

  console.log("📡 Fetching historical data from Scrappa...");

  try {
    const response = await axios.get(HISTORY_URL, {
      headers: {
        "X-API-KEY": API_KEY,
      },
      timeout: 30000,
    });

    const data = response.data;

    if (!data) {
      throw new Error(
        "Empty response received from Scrappa."
      );
    }

    if (!Array.isArray(data.prices)) {
      throw new Error(
        "Historical Dow Jones prices were not found in the response."
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
    console.log("✅ Dow Jones historical data saved.");
    console.log("");
    console.log(`📊 Historical records: ${data.prices.length}`);
    console.log(`📁 File: ${HISTORY_OUTPUT_FILE}`);
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ Failed to fetch Dow Jones historical data.");

    if (error.response) {
      console.error("HTTP Status:", error.response.status);
      console.error("API Response:", error.response.data);
    } else {
      console.error("Error:", error.message);
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
    // --------------------------------------------------------
    // LIVE
    // --------------------------------------------------------

    if (mode === "live") {
      await fetchLive();
      return;
    }

    // --------------------------------------------------------
    // HISTORY
    // --------------------------------------------------------

    if (mode === "history") {
      await fetchHistory();
      return;
    }

    // --------------------------------------------------------
    // BOTH
    // --------------------------------------------------------

    if (mode === "all") {
      await fetchLive();
      await fetchHistory();
      return;
    }

    // --------------------------------------------------------
    // INVALID COMMAND
    // --------------------------------------------------------

    console.log("");
    console.log("❌ Invalid command.");
    console.log("");

    console.log("Available commands:");
    console.log("");

    console.log("Live DJI:");
    console.log("node scripts/fetchDowJones.js live");
    console.log("");

    console.log("Historical DJI:");
    console.log("node scripts/fetchDowJones.js history");
    console.log("");

    console.log("Both:");
    console.log("node scripts/fetchDowJones.js all");
    console.log("");

    process.exit(1);
  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error("❌ DOW JONES UPDATE FAILED");
    console.error("==========================================");
    console.error(error.message);
    console.error("");

    process.exit(1);
  }
}


// ============================================================
// START
// ============================================================

main();
