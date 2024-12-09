const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
  pattern: "sub",
  desc: "Search for subtitles on cineru.lk",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { q, reply }) => {
  if (!q) {
    return reply("🔍 Please provide a search keyword.");
  }

  try {
    const apiUrl = `https://cinerulk-fetch.mahagedara-co.workers.dev/?sub=${encodeURIComponent(q)}`;
    console.log(`Fetching data from: ${apiUrl}`);
    
    // Fetch JSON from the worker
    const response = await fetchJson(apiUrl);
    console.log("API Response:", response);

    // Check if the response status is success
    if (response.status === "success" && Array.isArray(response.data)) {
      const message = "🎬 **Movie List** 🎬\n" +
        response.data
          .map((item, index) => `${index + 1}. ${item.title}\nURL: ${item.url}`)
          .join('\n');
      return reply(message);
    } else if (response.status === "error") {
      return reply(`⚠️ ${response.message}`);
    } else {
      return reply("❌ Unexpected response from the API.");
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    return reply("❌ An error occurred while fetching subtitles. Please try again later.");
  }
});
