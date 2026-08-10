function getBreakingScore(article) {
  const text =
    `${article.title || ""} ${article.description || ""}`
      .toLowerCase();

  // =======================================
  // SOURCE RELIABILITY
  // =======================================

  const sourceId =
    article.source?.id ||
    "";

  const sourceScores = {
    sec: 15,
    cnbc: 12,
    marketwatch: 10,
    coindesk: 10,
    cointelegraph: 8,
    decrypt: 6
  };

  let sourceScore = 0;

  for (const [source, points] of Object.entries(sourceScores)) {
    if (sourceId.toLowerCase().includes(source)) {
      sourceScore = points;
      break;
    }
  }

  // =======================================
  // FRESHNESS
  // =======================================

  let freshnessScore = 0;

  const publishedTime =
    new Date(article.published_at).getTime();

  if (!Number.isNaN(publishedTime)) {
    const hours =
      (Date.now() - publishedTime) /
      (1000 * 60 * 60);

    if (hours <= 1) {
      freshnessScore = 30;
    } else if (hours <= 3) {
      freshnessScore = 22;
    } else if (hours <= 6) {
      freshnessScore = 15;
    } else if (hours <= 12) {
      freshnessScore = 8;
    }
  }

  // =======================================
  // MAJOR EVENTS
  // =======================================

  const majorEvents = {
    "rate cut": 35,
    "rate hike": 35,
    "fed decision": 35,
    "federal reserve": 25,
    "interest rate": 20,
    "fomc": 30,

    "sec approves": 35,
    "sec approval": 35,
    "sec charges": 30,
    "sec enforcement": 30,

    "etf approval": 35,
    "bitcoin etf": 25,
    "ethereum etf": 25,
    "spot etf": 25,

    "bankruptcy": 35,
    "bankrupt": 35,

    "acquisition": 25,
    "merger": 25,

    "ipo": 20,

    "earnings": 15,
    "earnings report": 20,

    "profit warning": 25,

    "cyberattack": 30,
    "security breach": 25,

    "lawsuit": 15,
    "indicted": 25,

    "recall": 20,

    "market crash": 35,
    "crash": 20,

    "record high": 20,
    "all-time high": 25
  };

  let eventScore = 0;

  for (const [phrase, points] of Object.entries(majorEvents)) {
    if (text.includes(phrase)) {
      eventScore += points;
    }
  }

  // =======================================
  // IMPORTANT US ECONOMIC EVENTS
  // =======================================

  const economicEvents = {
    "jobs report": 30,
    "nonfarm payroll": 30,
    "unemployment rate": 25,
    "consumer price index": 30,
    "producer price index": 25,
    "inflation data": 25,
    "gdp": 20,
    "gross domestic product": 25,
    "tariffs": 20,
    "sanctions": 20
  };

  let economicScore = 0;

  for (const [phrase, points] of Object.entries(economicEvents)) {
    if (text.includes(phrase)) {
      economicScore += points;
    }
  }

  // =======================================
  // EXPLICIT BREAKING LANGUAGE
  // =======================================

  const breakingWords = {
    "breaking news": 35,
    breaking: 25,
    urgent: 25,
    alert: 20,
    "just in": 20,
    "developing story": 20
  };

  let breakingLanguageScore = 0;

  for (const [phrase, points] of Object.entries(breakingWords)) {
    if (text.includes(phrase)) {
      breakingLanguageScore += points;
    }
  }

  // =======================================
  // MARKET MOVEMENT
  // =======================================

  const marketWords = {
    "plunges": 15,
    "plunge": 15,
    "surges": 15,
    "surge": 15,
    "selloff": 15,
    "sell-off": 15,
    "rally": 10,
    "beats estimates": 15,
    "misses estimates": 15,
    "beats expectations": 15,
    "misses expectations": 15,
    "record": 5,
    "forecast": 5,
    "outlook": 5
  };

  let marketScore = 0;

  for (const [phrase, points] of Object.entries(marketWords)) {
    if (text.includes(phrase)) {
      marketScore += points;
    }
  }

  // =======================================
  // PREVENT ONE CATEGORY FROM DOMINATING
  // =======================================

  eventScore = Math.min(eventScore, 45);
  economicScore = Math.min(economicScore, 35);
  breakingLanguageScore = Math.min(breakingLanguageScore, 35);
  marketScore = Math.min(marketScore, 25);

  // =======================================
  // FINAL SCORE
  // =======================================

  const score =
    freshnessScore +
    sourceScore +
    eventScore +
    economicScore +
    breakingLanguageScore +
    marketScore;

  return Math.min(Math.round(score), 100);
}

module.exports = getBreakingScore;
