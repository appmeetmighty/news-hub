const axios = require("axios");
const cheerio = require("cheerio");

async function extractImage(url) {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);

    // 1. Open Graph
    let image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[property="og:image:url"]').attr("content");

    // 2. Twitter Card
    if (!image) {
      image = $('meta[name="twitter:image"]').attr("content");
    }

    // 3. JSON-LD
    if (!image) {
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html());

          if (json.image && !image) {
            if (typeof json.image === "string") {
              image = json.image;
            } else if (Array.isArray(json.image)) {
              image = json.image[0];
            } else if (json.image.url) {
              image = json.image.url;
            }
          }
        } catch (_) {}
      });
    }

    return image || "";
  } catch (e) {
    return "";
  }
}

module.exports = extractImage;