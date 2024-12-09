const config = require('../config');
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "sub",
    desc: "Search for subtitles on cineru.lk",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { args, q, reply }) => {
    if (!q) {
        return reply("🔍 Please provide a search keyword.");
    }

    try {
        const apiUrl = `https://cinerulk-fetch.mahagedara-co.workers.dev/?sub=${encodeURIComponent(q)}`;
        const response = await fetchJson(apiUrl);

        if (response.status === "success") {
            const message = "🎬 **Movie List** 🎬\n" +
                response.data.map((item, index) => `${index + 1}. ${item.title}\nURL: ${item.url}\n`).join('\n');
            return reply(message);
        } else {
            return reply(`⚠️ ${response.message}`);
        }
    } catch (err) {
        console.error(err);
        return reply("❌ An error occurred while fetching subtitles.");
    }
});

