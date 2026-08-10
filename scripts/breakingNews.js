function getBreakingScore(article) {
  const title = String(article.title || "").toLowerCase().trim();
  const description = String(article.description || "").toLowerCase().trim();
  const text = `${title} ${description}`;

  let score = 0;

  // --------------------------------------------------
  // 1. FRESHNESS
  // --------------------------------------------------

  const published = new Date(article.published_at).getTime();

  if (!Number.isNaN(published)) {
    const ageHours = Math.max(
      0,
      (Date.now() - published) / (1000 * 60 * 60)
    );

    if (ageHours <= 1) score += 20;
    else if (ageHours <= 3) score += 14;
    else if (ageHours <= 6) score += 8;
    else if (ageHours <= 12) score += 3;
  }

  // --------------------------------------------------
  // 2. TRUE BREAKING / CRITICAL EVENTS
  // --------------------------------------------------

  const critical = [
    ["breaking:", 80],
    ["breaking news", 80],
    ["just in:", 70],

    ["hack", 60],
    ["hacked", 60],
    ["cyberattack", 60],
    ["security breach", 60],
    ["exploit", 60],

    ["bankruptcy", 60],
    ["bankrupt", 60],

    ["market crash", 60],
    ["flash crash", 60],

    ["trading halted", 60],
    ["halted trading", 60],

    ["emergency", 55],

    ["indicted", 50],
    ["arrested", 50],
    ["charged", 45],

    ["sec approves", 55],
    ["sec approval", 55],

    ["etf approved", 55],
    ["etf approval", 55],

    ["rate cut", 55],
    ["rate hike", 55],

    ["fed decision", 55],
    ["federal reserve decision", 55],

    ["senate passes", 50],
    ["senate passed", 50],

    ["house passes", 50],
    ["house passed", 50],

    ["bill passes", 50],
    ["bill passed", 50]
  ];

  for (const [phrase, points] of critical) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // --------------------------------------------------
  // 3. MAJOR GOVERNMENT / REGULATORY ACTION
  // --------------------------------------------------

  const regulatory = [
    ["orders", 25],
    ["ordered", 25],

    ["bans", 25],
    ["banned", 25],

    ["prohibits", 25],
    ["prohibited", 25],

    ["lawsuit filed", 25],
    ["sued", 25],

    ["regulator approves", 30],
    ["regulator approved", 30],

    ["new regulation", 20],
    ["new rules", 20],

    ["regulation takes effect", 25]
  ];

  for (const [phrase, points] of regulatory) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // --------------------------------------------------
  // 4. MAJOR MARKET MOVEMENT
  // --------------------------------------------------

  const marketMoving = [
    ["all-time high", 30],
    ["all time high", 30],
    ["record high", 30],

    ["plunges", 25],
    ["plunge", 25],

    ["crashes", 25],
    ["crash", 25],

    ["surges", 20],
    ["surge", 20],

    ["soars", 20],
    ["soar", 20],

    ["collapses", 25],
    ["collapse", 25],

    ["selloff", 20],
    ["sell-off", 20],

    ["shares fall", 20],
    ["shares rise", 20],

    ["stocks fall", 20],
    ["stocks rise", 20],

    ["bitcoin drops", 25],
    ["bitcoin rises", 20],
    ["bitcoin surges", 25],
    ["bitcoin plunges", 30],

    ["ethereum drops", 25],
    ["ethereum surges", 25],
    ["ethereum plunges", 30]
  ];

  for (const [phrase, points] of marketMoving) {
    if (text.includes(phrase)) {
      score += points;
    }
  }

  // --------------------------------------------------
  // 5. STRONG PENALTY FOR ANALYSIS / OPINION / EXPLAINERS
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
    "what happened",
    "report",
    "founder says",
    "founder warns",
    "experts say",
    "analysts say"
  ];

  for (const phrase of analysisWords) {
    if (title.includes(phrase)) {
      score -= 45;
    } else if (text.includes(phrase)) {
      score -= 20;
    }
  }

  // --------------------------------------------------
  // 6. OPINION / FUTURE / SPECULATION TITLES
  // --------------------------------------------------

  const speculativeTitlePatterns = [
    "will never",
    "will look like",
    "could",
    "might",
    "may",
    "probably",
    "expected to",
    "set to",
    "what happens next",
    "what to expect",
    "why it matters"
  ];

  for (const phrase of speculativeTitlePatterns) {
    if (title.includes(phrase)) {
      score -= 35;
    }
  }

  // --------------------------------------------------
  // 7. FINAL NORMALIZATION
  // --------------------------------------------------

  score = Math.round(score);

  return Math.max(0, Math.min(score, 100));
}

module.exports = getBreakingScore;
