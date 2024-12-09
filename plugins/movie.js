const config = require('../config')
const { cmd } = require('../command');
const puppeteer = require('puppeteer');

cmd({
  pattern: "sub",
  desc: "Search for movie subtitles on cineru.lk",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { q, reply }) => {
  if (!q) {
    return reply("🔍 Please provide a search keyword.");
  }

  try {
    const searchUrl = `https://cineru.lk/?s=${encodeURIComponent(q)}`;
    console.log(`Searching on: ${searchUrl}`);

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    // Extract movie titles
    const movieList = await page.evaluate(() => {
      const titles = [];
      document.querySelectorAll('.post-box-title').forEach(el => {
        titles.push({
          title: el.textContent.trim(),
          url: el.querySelector('a')?.href || null
        });
      });
      return titles;
    });

    await browser.close();

    // Check if movies are found
    if (movieList.length > 0) {
      const message = "🎬 **Movie List** 🎬\n" +
        movieList
          .map((item, index) => `${index + 1}. ${item.title}\nURL: ${item.url || 'N/A'}`)
          .join('\n');
      return reply(message);
    } else {
      return reply("⚠️ No movies found for your search query.");
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    return reply("❌ An error occurred while fetching movie data. Please try again later.");
  }
});
