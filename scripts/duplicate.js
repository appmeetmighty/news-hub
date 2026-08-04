function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function removeDuplicates(articles) {
  const seen = new Set();

  return articles.filter((article) => {
    const key = normalize(article.title);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

module.exports = removeDuplicates;