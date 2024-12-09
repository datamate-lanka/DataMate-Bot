const config = require('../config');
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
  pattern: "sub",
  desc: "Download subtitles from cineru.lk",
  category: "main",
  filename: __filename
},
async(conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
  try {
    if (!q) {
      return reply("🔍 Please provide a movie name to search for subtitles.");
    }

    const apiUrl = `https://cinerulk-fetch.mahagedara-co.workers.dev/?sub=${encodeURIComponent(q)}`;
    const response = await fetchJson(apiUrl);

    if (response && response.status === "success ✅" && response.data.length > 0) {
      let message = "🎬 **Movie List** 🎬\n";
      response.data.forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n🔗 ${item.url}\n\n`;
      });
      return reply(message);
    } else {
      return reply("⚠️ No subtitles found for your query.");
    }
  } catch (error) {
    console.error(error);
    return reply("❌ Error fetching subtitles. Please try again.");
  }
});
