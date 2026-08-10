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
      score += 40;
    } else if (hours <= 3) {
      score += 30;
    } else if (hours <= 6) {
      score += 20;
    } else if (hours <= 12) {
      score += 10;
    }
  }

  const text =
    `${article.title || ""} ${article.description || ""}`.toLowerCase();

  // ---------------------------------------
  // Major financial / crypto events
  // ---------------------------------------

  const highImpact = {
    "rate cut": 30,
    "rate hike": 30,
    "interest rate": 25,
    "federal reserve": 25,
    "fed decision": 30,

    "sec approves": 30,
    "sec approval": 30,
    "sec charges": 30,
    "sec lawsuit": 30,

    "etf approval": 30,
    "bitcoin etf": 20,
    "ethereum etf": 20,

    bankruptcy: 30,
    bankrupt: 30,

    acquisition: 25,
    merger: 25,

    ipo: 20,

    earnings: 15,
    "quarterly results": 15,

    guidance: 15,
    "profit warning": 25,

    hack: 25,
    hacked: 30,
    cyberattack: 30,

    lawsuit: 15,
    indicted: 25,
    charged: 20,

    approval: 15,
    approved: 15,

    recall: 15,

    crash: 25,
    "market crash": 30,

    "record high": 20,
    "all-time high": 25,

    plunges: 15,
    plunge: 15,
    surges: 15,
    surge: 15,

    // Regulatory events
    "regulatory action": 25,
    regulatory: 15,
    regulator: 15,
    ordered: 15,
    orders: 15,
    banned: 25,
    ban: 20,
    suspended: 20,
    suspends: 20,
    offline: 10,
    investigation: 20,
    investigates: 20,
    enforcement: 25
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
    breaking: 20,
    urgent: 20,
    alert: 15,
    "just in": 15,
    "developing story": 15
  };

  for (const [phrase, points] of Object.entries(breakingWords)) {
    if (text.includes(phrase)) {
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

    rally: 10,
    selloff: 10,
    "sell-off": 10,

    record: 5,
    forecast: 10,
    outlook: 10
  };

  for (const [phrase, points] of Object.entries(marketWords)) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // ---------------------------------------
  // Avoid false "breaking" signals
  // ---------------------------------------

  const speculativeWords = [
    "could",
    "might",
    "may",
    "would",
    "likely",
    "probably",
    "potential",
    "possible",
    "expected",
    "could be"
  ];

  const hasSpeculativeLanguage = speculativeWords.some(word =>
    text.includes(word)
  );

  if (hasSpeculativeLanguage) {
    score -= 20;
  }

  // ---------------------------------------
  // Final score
  // ---------------------------------------

  return Math.max(
    0,
    Math.min(Math.round(score), 100)
  );
}

module.exports = getBreakingScore;
