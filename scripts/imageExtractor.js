const axios = require("axios");
const cheerio = require("cheerio");

async function extractImage(url) {
    try {
        const { data } = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(data);

        return (
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            ""
        );
    } catch (e) {
        return "";
    }
}

module.exports = extractImage;