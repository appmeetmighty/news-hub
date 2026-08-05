function getReadingTime(text = "") {
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

module.exports = getReadingTime;