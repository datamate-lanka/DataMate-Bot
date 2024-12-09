const config = require('../config');
const { cmd, commands } = require('../command');
const { getSubz } = require("subz.lk");
const axios = require('axios');
const fs = require('fs');

cmd({
    pattern: "subtitle",
    desc: "Fetch subtitle details from subz.lk and send.",
    category: "media",
    filename: __filename
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (args.length === 0) {
            return reply("Please provide a movie or series name to fetch subtitles.");
        }

        const query = args.join(" ");
        const subz = await getSubz(query);

        if (!subz.status) {
            return reply("Subtitle not found for the given query. Please try a different one.");
        }

        const { title, year, rate, image, dllinks } = subz.result;
        const { filesize, dllink } = dllinks[0];

        // Download the subtitle file
        const response = await axios.get(dllink, { responseType: 'stream' });
        const filePath = `./${title.replace(/[^a-zA-Z0-9]/g, '_')}.zip`; // Clean title for file naming
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Send the image with a caption
        const caption = `🎬 *Title:* ${title}\n📅 *Year:* ${year}\n⭐ *Rating:* ${rate}\n💾 *Filesize:* ${filesize}`;
        await conn.sendMessage(m.chat, { image: { url: image }, caption });

        // Send the downloaded subtitle file
        await conn.sendMessage(m.chat, { document: { url: filePath }, fileName: `${title}.srt`, mimetype: 'text/plain' });

        // Clean up the downloaded file
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error(error);
        reply("An error occurred while fetching the subtitle. Please try again later.");
    }
});
