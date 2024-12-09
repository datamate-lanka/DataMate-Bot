const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');
const fetch = require('node-fetch'); // Assuming fetch is required for HTTP requests

cmd({
    pattern: "sub",
    desc: "cineru.lk sub download",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Perform search based on user query
        const keyword = q.trim();
        if (!keyword) {
            return reply("🔍 Please provide a search term for subtitles.");
        }

        const searchUrl = `https://cineru.lk/?s=${encodeURIComponent(keyword)}`;
        const searchResponse = await fetch(searchUrl);

        if (searchResponse.ok) {
            const searchHtml = await searchResponse.text();
            const results = extractTitles(searchHtml);

            if (results.length > 0) {
                const numberedList = results.map((item, index) => `${index + 1}. ${sanitizeTitle(item.title)}`).join("\n");
                await reply(`🎬 Search results:\n\n${numberedList}\n\nPlease reply with the movie number to get the subtitle download link.`);
                // Store results for later access (use the session, e.g., in a map or database)
                searchResultsCache[from] = results;
            } else {
                await reply("⚠️ No results found for your search.");
            }
        } else {
            await reply("❌ Search failed. Please try again.");
        }
    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});

// Handle movie index selection
cmd({
    pattern: "sub [0-9]+",
    desc: "Download subtitle from cineru.lk",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const movieIndex = parseInt(args[0], 10) - 1;

        if (searchResultsCache[from] && searchResultsCache[from][movieIndex]) {
            const movie = searchResultsCache[from][movieIndex];
            const result = await getPosterImageUrl(movie.url);

            if (result && result.posterUrl) {
                const movieName = await getMovieName(movie.url);
                const responseText = `🌻 ${movieName} 🌼\n\n 🎉The provided subtitle corresponds to: ${result.descriptionText}\n\nSubtitles are sourced from cineru.lk.💕`;

                // Send poster image with caption
                await conn.sendImage(from, result.posterUrl, responseText);

                // Get the download link and send it
                const downloadLink = await getDownloadLink(movie.url);
                if (downloadLink) {
                    await reply(`Download Link: ${downloadLink}`);
                } else {
                    await reply("❌ No download link found. Please try again later.");
                }
            } else {
                await reply("❌ Poster image not found.");
            }
        } else {
            await reply("❌ Invalid movie index. Please try again.");
        }
    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});

// Extract titles from search results HTML
function extractTitles(html) {
    const regex = /<h2 class="post-box-title">\s*<a href="([^"]+)"[^>]*>(.*?)<\/a>/g;
    const matches = [...html.matchAll(regex)];
    return matches.map((match) => ({
        url: match[1],
        title: match[2].replace(/Subtitles.*/, "Subtitles").trim(),
    }));
}

// Sanitize movie titles
function sanitizeTitle(title) {
    return title.replace(/[^A-Za-z0-9\s]/g, "").trim();
}

// Get movie poster URL
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

// Get download link
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

// Get movie name
async function getMovieName(pageUrl) {
    try {
        const response = await fetch(pageUrl);
        const text = await response.text();

        const regexMovieName = /<h1 class="name post-title entry-title"><span itemprop="name">([^<]+)<\/span><\/h1>/;

        const match = text.match(regexMovieName);

        if (match && match[1]) {
            return match[1].trim();
        } else {
            return "Unknown Movie";
        }
    } catch (error) {
        console.error("Error fetching movie name:", error);
        return "Unknown Movie";
    }
}
