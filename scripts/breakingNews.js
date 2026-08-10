function getBreakingScore(article) {
  let score = 0;

  const title = String(article.title || "").toLowerCase();
  const description = String(article.description || "").toLowerCase();
  const text = `${title} ${description}`;

  // --------------------------------------------------
  // 1. Freshness
  // --------------------------------------------------

  const publishedTime = new Date(article.published_at).getTime();

  if (!Number.isNaN(publishedTime)) {
    const ageHours =
      (Date.now() - publishedTime) / (1000 * 60 * 60);

    if (ageHours <= 1) {
      score += 45;
    } else if (ageHours <= 3) {
      score += 35;
    } else if (ageHours <= 6) {
      score += 25;
    } else if (ageHours <= 12) {
      score += 15;
    } else if (ageHours <= 24) {
      score += 5;
    }
  }

  // --------------------------------------------------
  // 2. Strong breaking events
  // --------------------------------------------------

  const majorEvents = {
    "rate cut": 35,
    "rate hike": 35,
    "fed decision": 35,
    "emergency meeting": 35,

    "etf approval": 35,
    "etf approved": 35,
    "sec approves": 35,
    "sec approval": 35,

    bankruptcy: 35,
    bankrupt: 35,

    acquisition: 30,
    merger: 30,

    "cyber attack": 30,
    cyberattack: 30,
    hacked: 30,
    hack: 25,
    exploit: 25,
    exploited: 25,
    breach: 25,

    "market crash": 35,
    crash: 25,

    "all-time high": 30,
    "record high": 25,

    "profit warning": 30,
    "earnings miss": 25,

    indicted: 30,
    charged: 25,
    lawsuit: 20
  };

  for (const [phrase, points] of Object.entries(majorEvents)) {
    if (text.includes(phrase)) {
      score += points;
      break;
    }
  }

  // --------------------------------------------------
  // 3. Strong market movement
  // --------------------------------------------------

  const marketMovement = {
    surges: 15,
    surge: 15,
    plunges: 15,
    plunge: 15,
    rallies: 12,
    rally: 12,
    selloff: 15,
    "sell-off": 15,
    "shares rise": 12,
    "shares fall": 12,
    "stock rises": 12,
    "stock falls": 12,
    "stocks rise": 12,
    "stocks fall": 12
  };

  for (const [phrase, points] of Object.entries(marketMovement)) {
    if (text.includes(phrase)) {
      score += points;
      break;
    }
  }

  // --------------------------------------------------
  // 4. Explicit breaking language
  // --------------------------------------------------

  const breakingWords = {
    breaking: 20,
    "just in": 20,
    urgent: 20,
    alert: 15,
    "developing story": 15
  };

  for (const [phrase, points] of Object.entries(breakingWords)) {
    if (text.includes(phrase)) {
      score += points;
      break;
    }
  }

  // --------------------------------------------------
  // 5. Important financial language
  // --------------------------------------------------

  const financialWords = {
    approval: 10,
    approved: 10,
    guidance: 10,
    forecast: 8,
    outlook: 8,
    earnings: 8,
    "record revenue": 10,
    "record profit": 10
  };

  for (const [phrase, points] of Object.entries(financialWords)) {
    if (text.includes(phrase)) {
      score += points;
      break;
    }
  }

  // --------------------------------------------------
  // 6. Final score
  // --------------------------------------------------

  return Math.min(Math.round(score), 100);
}

module.exports = getBreakingScore;
