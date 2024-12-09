const {cmd, commands} = require('../command');
const {fetchJson} = require('../lib/functions');

cmd({
    pattern: "sub",
    desc: "cineru.lk sub download",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
    try {
        // Step 1: Search for movies based on the user query
        const searchUrl = `https://cineru.lk/?s=${encodeURIComponent(q)}`;
        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
            return reply("❌ සෙවුම් කාර්යය අසාර්ථකයි. නැවත උත්සහා කරන්න.");
        }

        const searchHtml = await searchResponse.text();
        const results = extractTitles(searchHtml);

        if (results.length === 0) {
            return reply("⚠️ සෙවුම් සඳහා ප්‍රතිඵල කිසිවක් නොමැත.");
        }

        // Step 2: Display search results
        const numberedList = results.map((item, index) => `${index + 1}. ${sanitizeTitle(item.title)}`).join("\n");
        await reply(`🎬 සෙවුම් ප්‍රතිඵල:\n\n${numberedList}\n\nඋපසිරුසි ලබාගැනීම සඳහා චිත්‍රපට අංකය ලබාදෙන්න`);

        // Step 3: Handle user selection
        const movieIndex = parseInt(args[0], 10) - 1;
        if (results[movieIndex]) {
            const movie = results[movieIndex];
            const result = await getPosterImageUrl(movie.url);

            if (!result) {
                return reply("❌ පොස්ටර් එක හමුනොවීය, උදව් සඳහා /help බාවිතා කරන්න");
            }

            const movieName = await getMovieName(movie.url);
            const responseText = `🌻 ${movieName} 🌼 \n\n 🎉මෙම ලබා දී ඇති උපසිරැසිය ${result.descriptionText} පිටපත් සඳහා ගැලපේ \n\n  උපසිරසි පිටපත cineru.lk වෙබ් අඩවිය මගින් ලබා දී ඇත.💕 \n\n\n 𝐂𝐢𝐧𝐞𝐌𝐚𝐭𝐞 𝐁𝐨𝐭 - 𝟐𝟎𝟐𝟒`;

            const downloadLink = await getDownloadLink(movie.url);
            if (downloadLink) {
                await reply(responseText);
                // Send the download link as a document
                await conn.sendMessage(from, {document: {url: downloadLink}, fileName: `${movieName} - sub.zip`}, {quoted: mek});
            } else {
                await reply("❌ බාගත කිරීමේ ලින්ක් එක හමු නොවීය, උදව් සඳහා /help බාවිතා කරන්න");
            }
        } else {
            return reply("❌ ඔබ ලබාදුන් අංකය වැරදී, කරුණාකර නැවත උත්සහ කරන්න");
        }
    } catch (e) {
        console.log(e);
        return reply(`❌ දෝෂයක් සිදුවූයේ: ${e}`);
    }
});

// Helper functions to extract titles, poster image, download link, and movie name
function extractTitles(html) {
    const regex = /<h2 class="post-box-title">\s*<a href="([^"]+)"[^>]*>(.*?)<\/a>/g;
    const matches = [...html.matchAll(regex)];
    return matches.map((match) => ({
        url: match[1],
        title: match[2].replace(/Subtitles.*/, "Subtitles").trim(),
    }));
}

function sanitizeTitle(title) {
    return title.replace(/[^A-Za-z0-9\s]/g, "").trim();
}

async function getPosterImageUrl(pageUrl) {
    try {
        const response = await fetch(pageUrl);
        const text = await response.text();

        const regexImage = /<img[^>]+class="attachment-slider size-slider wp-post-image"[^>]+src="(https:\/\/[^"]+)"/;
        const regexDescriptionText = /<div[^>]+class="neon"[^>]*>(.*?)<\/div>/;

        const matchImage = text.match(regexImage);
        const matchDescriptionText = text.match(regexDescriptionText);

        if (matchImage && matchImage[1]) {
            const posterUrl = matchImage[1];
            const descriptionText = matchDescriptionText ? matchDescriptionText[1] : "Description Not Found";
            return { posterUrl, descriptionText };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching poster image:", error);
        return null;
    }
}

async function getDownloadLink(pageUrl) {
    try {
        const response = await fetch(pageUrl);
        const text = await response.text();

        const regexDownloadLink = /<a[^>]+id="btn-download"[^>]+data-link="([^"]+)"/;

        const match = text.match(regexDownloadLink);

        if (match && match[1]) {
            return match[1];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching download link:", error);
        return null;
    }
}

async function getMovieName(pageUrl) {
    try {
        const response = await fetch(pageUrl);
        const text = await response.text();

        const regexMovieName = /<h1 class="name post-title entry-title"><span itemprop="name">([^<]+)<\/span><\/h1>/;

        const match = text.match(regexMovieName);

        if (match && match[1]) {
            let movieName = match[1].trim();
            const subtitleIndex = movieName.indexOf("Sinhala Subtitles");
            if (subtitleIndex !== -1) {
                movieName = movieName.substring(0, subtitleIndex + "Sinhala Subtitles".length);
            }
            return movieName;
        } else {
            return "Unknown Movie";
        }
    } catch (error) {
        console.error("Error fetching movie name:", error);
        return "Unknown Movie";
    }
}
