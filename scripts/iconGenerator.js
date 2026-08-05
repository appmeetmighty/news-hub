const domains = {
  aapl: "apple.com",
  amzn: "amazon.com",
  googl: "google.com",
  meta: "meta.com",
  blk: "blackrock.com",
  mstr: "strategy.com",
  msft: "microsoft.com",
  nvda: "nvidia.com",
  tsla: "tesla.com",
};

function getIcon(entity) {
  if (entity.type === "crypto") {
    return `https://assets.coincap.io/assets/icons/${entity.id}@2x.png`;
  }

  if (entity.type === "company") {
    const domain = domains[entity.id];

    if (domain) {
      return `https://logo.clearbit.com/${domain}`;
    }
  }

  if (entity.type === "commodity") {
    return "";
  }

  return "";
}

module.exports = getIcon;