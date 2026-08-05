function getBreakingScore(article) {
  let score = 0;

  // Fresh news
  const hours =
    (Date.now() - new Date(article.published_at).getTime()) /
    (1000 * 60 * 60);

  if (hours <= 1) score += 50;
  else if (hours <= 3) score += 30;
  else if (hours <= 6) score += 15;

  const text = `${article.title} ${article.description}`.toLowerCase();

  const keywords = {
    breaking: 30,
    urgent: 30,
    hack: 25,
    hacked: 25,
    etf: 20,
    sec: 15,
    fed: 15,
    earnings: 15,
    approval: 15,
    lawsuit: 10,
    crash: 10,
    crashes: 10,
    surges: 10,
    plunges: 10,
    record: 5
  };

  for (const [word, points] of Object.entries(keywords)) {
    if (text.includes(word)) {
      score += points;
    }
  }

  return Math.min(score, 100);
}

module.exports = getBreakingScore;