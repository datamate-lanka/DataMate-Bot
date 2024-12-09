const { getSubz } = require("subz.lk");

cmd({
    pattern: "subz",
    desc: "Download subtitle from subz.lk.",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) {
            return reply("Please provide a movie name to search for subtitles.");
        }

        // Fetch subtitle details
        const subz = await getSubz(args.join(" "));
        if (!subz.status) {
            return reply("No subtitles found for the given movie name.");
        }

        const { title, year, rate, result: { dllinks, image } } = subz;
        const { filesize, dllink } = dllinks[0];

        // Download subtitle file
        const res = await fetch(dllink);
        const buffer = await res.buffer();

        // Send details as caption with the image
        const caption = `🎬 *Title:* ${title}\n📅 *Year:* ${year}\n⭐ *Rating:* ${rate}\n📂 *Filesize:* ${filesize}`;
        await conn.sendMessage(m.chat, { image: { url: image }, caption }, { quoted: mek });

        // Send the downloaded subtitle file
        await conn.sendMessage(m.chat, { document: buffer, fileName: `${title}.srt` }, { quoted: mek });
    } catch (error) {
        console.error(error);
        reply("An error occurred while fetching or downloading the subtitle.");
    }
});
