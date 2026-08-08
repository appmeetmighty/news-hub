function getBreakingScore(article) {
  let score = 0;

  const publishedTime = new Date(article.published_at).getTime();

  // ---------------------------------------
  // Freshness
  // ---------------------------------------

  if (!Number.isNaN(publishedTime)) {
    const hours =
      (Date.now() - publishedTime) /
      (1000 * 60 * 60);

    if (hours <= 1) {
      score += 50;
    } else if (hours <= 3) {
      score += 35;
    } else if (hours <= 6) {
      score += 20;
    } else if (hours <= 12) {
      score += 10;
    }
  }

  const text =
    `${article.title || ""} ${article.description || ""}`.toLowerCase();

  // ---------------------------------------
  // Major financial events
  // ---------------------------------------

  const highImpact = {
    "rate cut": 35,
    "rate hike": 35,
    "interest rate": 30,
    "federal reserve": 30,
    "fed decision": 35,

    "sec approves": 35,
    "sec approval": 35,
    "sec charges": 30,
    "sec lawsuit": 30,

    "etf approval": 35,
    "bitcoin etf": 30,
    "ethereum etf": 30,

    "bankruptcy": 35,
    "bankrupt": 35,

    "acquisition": 30,
    "merger": 30,

    "ipo": 25,

    "earnings": 20,
    "quarterly results": 20,

    "guidance": 20,
    "profit warning": 30,

    "hack": 30,
    "hacked": 30,
    "cyberattack": 30,

    "lawsuit": 20,
    "indicted": 30,
    "charged": 25,

    "approval": 20,
    "approved": 20,

    "recall": 20,

    "crash": 25,
    "market crash": 35,

    "record high": 25,
    "all-time high": 30,

    "plunges": 20,
    "plunge": 20,
    "surges": 20,
    "surge": 20
  };

  for (const [phrase, points] of Object.entries(highImpact)) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // ---------------------------------------
  // Breaking language
  // ---------------------------------------

  const breakingWords = {
    breaking: 25,
    urgent: 25,
    alert: 20,
    "just in": 20,
    "developing story": 20
  };

  for (const [word, points] of Object.entries(breakingWords)) {
    if (text.includes(word)) {
      score += points;
    }
  }

  // ---------------------------------------
  // Market-moving language
  // ---------------------------------------

  const marketWords = {
    "shares rise": 10,
    "shares fall": 10,
    "stock rises": 10,
    "stock falls": 10,
    "stocks rise": 10,
    "stocks fall": 10,

    "rally": 10,
    "selloff": 15,
    "sell-off": 15,

    "record": 5,
    "forecast": 10,
    "outlook": 10
  };

  for (const [word, points] of Object.entries(marketWords)) {
    if (text.includes(word)) {
      score += points;
    }
  }

  // ---------------------------------------
  // Final score
  // ---------------------------------------

  return Math.min(Math.round(score), 100);
}

module.exports = getBreakingScore;
