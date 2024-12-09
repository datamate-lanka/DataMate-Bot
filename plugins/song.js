const { cmd, commands } = require('../command');
const fg = require('api-dylux')
const yts = require('yt-search')

cmd({
    pattern: "song",
    desc: "download song",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, reply }) => {
    try {
        if (!q) return reply("Please provide a URL or title.");

        const search = await yts(q);
        const data = search.videos[0];
        const url = data.url;

        let desc = `🎶 ${data.title} \n\n- Duration : ${data.timestamp} \n- Published : ${data.ago} \n- Views  : ${data.views}\n\n*ඔබට සිංදුව අවශ්‍ය ආකාරය කුමක්ද*\n1. Document file\n2. Audio file\n\n*ඔබට අවශ්‍ය ආකාරය රිප්ලයි කරන්න*\n\n> CineMate Bot - 2024`;

        await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek });

        const down = await fg.yta(url);
        const downloadUrl = down.dl_url;

        // Wait for user reply
        conn.once('chat-update', async (update) => {
            if (!update.messages) return;
            const response = update.messages.all()[0];
            const userReply = response.message?.conversation || response.message?.extendedTextMessage?.text;

            if (response.key.remoteJid === from && response.message && response.key.participant === sender) {
                if (userReply === "1") {
                    // Send as Document
                    await conn.sendMessage(from, { 
                        document: { url: downloadUrl }, 
                        mimetype: "audio/mpeg", 
                        fileName: `CineMate-Bot-${data.title}.mp3`, 
                        caption: "> CineMate Bot - 2024" 
                    }, { quoted: mek });
                } else if (userReply === "2") {
                    // Send as Audio
                    await conn.sendMessage(from, { 
                        audio: { url: downloadUrl }, 
                        mimetype: "audio/mpeg" 
                    }, { quoted: mek });
                } else {
                    reply("Invalid response. Please reply with 1 or 2.");
                }
            }
        });
    } catch (e) {
        console.error(e);
        reply(`Error: ${e.message}`);
    }
});
