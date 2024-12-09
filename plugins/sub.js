const {cmd, commands} = require('../command');
const {fetchJson} = require('../lib/functions');
const {fetchJson} = require('../lib/functions')

cmd({
    pattern: "sub",
    desc: "cineru.lk sub download",
    category: "main",
    filename: __filename
},
async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, reply}) => {
    try {
        let data = await fetchJson(`https://cinerulk-fetch.mahagedara-co.workers.dev/?sub=${q}`);
        if (Array.isArray(data) && data.length > 0) {
            let message = "🎬 **Movie List** 🎬\n";
            data.forEach((item, index) => {
                message += `${index + 1}. ${item.title}\n`;
            });
            return reply(message);
        } else {
            return reply("⚠️ No subtitles found for your query.");
        }
    } catch (e) {
        console.error(e);
        return reply(`⚠️ Error: ${e.message}`);
    }
});

