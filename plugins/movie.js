const config = require('../config')
const {cmd , commands} = require('../command')
const { sinhalaSub } = require("mrnima-moviedl");

cmd({
    pattern: "movie",
    desc: "Search and download Sinhala Subtitle Movies/TV Shows",
    category: "main",
    filename: __filename,
}, async (conn, mek, m, {
    args, reply, command
}) => {
    try {
        // SinhalaSub API Initialize
        const movieAPI = await sinhalaSub();
        
        // Command Structure
        if (!args.length) {
            return reply(`⚠️ කරුණාකර චිත්‍රපටය බාගත කිරීමට නමක් ලබාදෙන්න \n\n *උදා:- .movie jawan*`);
        }

        const query = args.join(" ");
        const result = await movieAPI.search(query);

        if (!result.result || result.result.length === 0) {
            return reply(`🛑 "${query}" සඳහා කිසිවක් සොයාගත නොහැකි විය.`);
        }

        let message = `🎬 *${query} සඳහා සොයාගත් ප්‍රතිඵල*: \n\n`;

        result.result.forEach((item, index) => {
            message += `*${index + 1}. ${item.title}*\n`;
            message += `🖼️ ${item.img}\n`;
            message += `🔗 [Link](${item.link})\n`;
            message += `\n`;
        });

        reply(message);
    } catch (error) {
        console.error(error);
        reply(`⚠️ දෝෂයක් ඇතිවිය: ${error.message}`);
    }
});
