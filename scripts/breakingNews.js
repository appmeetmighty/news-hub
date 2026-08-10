function getBreakingScore(article) {
  const title = String(article.title || "").toLowerCase();
  const description = String(article.description || "").toLowerCase();
  const text = `${title} ${description}`;

  let score = 0;

  // --------------------------------------------------
  // FRESHNESS
  // --------------------------------------------------

  const published = new Date(article.published_at).getTime();

  if (!Number.isNaN(published)) {
    const ageHours = Math.max(
      0,
      (Date.now() - published) / (1000 * 60 * 60)
    );

    if (ageHours <= 1) score += 25;
    else if (ageHours <= 3) score += 18;
    else if (ageHours <= 6) score += 10;
    else if (ageHours <= 12) score += 5;
  }

  // --------------------------------------------------
  // CRITICAL EVENTS
  // --------------------------------------------------

  const critical = [
    ["hack", 35],
    ["hacked", 35],
    ["cyberattack", 35],
    ["security breach", 35],
    ["exploit", 35],

    ["bankruptcy", 35],
    ["bankrupt", 35],

    ["market crash", 35],
    ["flash crash", 35],

    ["trading halted", 35],
    ["halted trading", 35],

    ["sec approves", 35],
    ["sec approval", 35],
    ["sec charges", 35],
    ["sec lawsuit", 30],

    ["rate cut", 35],
    ["rate hike", 35],
    ["fed decision", 35],
    ["federal reserve decision", 35],

    ["etf approval", 35],

    ["indicted", 30],
    ["charged", 25],

    ["emergency", 30]
  ];

  for (const [phrase, points] of critical) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // --------------------------------------------------
  // REGULATORY / GOVERNMENT ACTION
  // --------------------------------------------------

  const regulatory = [
    ["orders", 25],
    ["ordered", 25],
    ["bans", 25],
    ["banned", 25],
    ["prohibits", 25],
    ["prohibited", 25],

    ["senate vote", 25],
    ["senate votes", 25],
    ["senate passed", 30],
    ["senate passes", 30],

    ["house vote", 20],
    ["house passed", 25],
    ["house passes", 25],

    ["bill passes", 30],
    ["bill passed", 30],

    ["regulator approves", 30],
    ["regulator approved", 30],

    ["new rules", 20],
    ["new regulation", 20],
    ["regulation takes effect", 25],

    ["lawsuit filed", 25],
    ["sued", 25]
  ];

  for (const [phrase, points] of regulatory) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // --------------------------------------------------
  // MAJOR MARKET MOVEMENT
  // --------------------------------------------------

  const marketMoving = [
    ["record high", 20],
    ["all-time high", 20],
    ["all time high", 20],

    ["plunges", 15],
    ["plunge", 15],
    ["crashes", 15],
    ["crash", 15],

    ["surges", 12],
    ["surge", 12],

    ["selloff", 12],
    ["sell-off", 12],

    ["shares fall", 10],
    ["shares rise", 10],
    ["stocks fall", 10],
    ["stocks rise", 10],

    ["bitcoin drops", 15],
    ["bitcoin rises", 10],
    ["bitcoin surges", 15],
    ["bitcoin plunges", 20],

    ["ethereum drops", 15],
    ["ethereum surges", 15],
    ["ethereum plunges", 20]
  ];

  for (const [phrase, points] of marketMoving) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // --------------------------------------------------
  // EXPLICIT BREAKING LANGUAGE
  // --------------------------------------------------

  const breakingLanguage = [
    ["breaking:", 30],
    ["breaking news", 30],
    ["just in:", 25],
    ["urgent:", 25],
    ["developing:", 20]
  ];

  for (const [phrase, points] of breakingLanguage) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // --------------------------------------------------
  // IMPORTANT EVENTS
  // --------------------------------------------------

  const important = [
    ["approval", 10],
    ["approved", 10],
    ["lawsuit", 10],
    ["earnings", 10],
    ["ipo", 10],
    ["profit warning", 15],
    ["recall", 10]
  ];

  for (const [phrase, points] of important) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // --------------------------------------------------
  // ANALYSIS / SPECULATION PENALTY
  // --------------------------------------------------

  const analysisWords = [
    "will look like",
    "what is",
    "what are",
    "how to",
    "explained",
    "explainer",
    "analysis",
    "opinion",
    "why",
    "could",
    "might",
    "probably",
    "proposal",
    "proposed",
    "interview",
    "prediction",
    "forecast",
    "guide",
    "here's what happened",
    "what happened"
  ];

  for (const phrase of analysisWords) {
    if (title.includes(phrase)) {
      score -= 25;
    } else if (text.includes(phrase)) {
      score -= 10;
    }
  }

  // --------------------------------------------------
  // FINAL
  // --------------------------------------------------

  return Math.max(0, Math.min(Math.round(score), 100));
}

module.exports = getBreakingScore;
