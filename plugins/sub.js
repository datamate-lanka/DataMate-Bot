const { cmd, commands } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

// Global cache to store search results
const searchResultsCache = {};

cmd({
    pattern: "sub",
    desc: "cineru.lk sub download",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
    try {
        // Perform search based on user query
        const keyword = q.trim();
        if (!keyword) {
            return reply("🔍 Please provide a search term for subtitles.");
        }

        try {
            const searchUrl = `https://cineru.lk/?s=${encodeURIComponent(keyword)}`;
            const { data: searchHtml } = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const results = extractTitles(searchHtml);

            if (results.length > 0) {
                const numberedList = results.map((item, index) => `${index + 1}. ${sanitizeTitle(item.title)}`).join("\n");
                await reply(`🎬 Search results:\n\n${numberedList}\n\nPlease reply with the movie number to get the subtitle download link.`);
                
                // Store results for later access
                searchResultsCache[from] = results;
            } else {
                await reply("⚠️ No results found for your search.");
            }
        } catch (searchError) {
            console.error('Search Error:', searchError);
            await reply("❌ Search failed. Please try again.");
        }
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});

// Handle movie index selection
cmd({
    pattern: "sub [0-9]+",
    desc: "Download subtitle from cineru.lk",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
    try {
        const movieIndex = parseInt(args[0], 10) - 1;

        if (searchResultsCache[from] && searchResultsCache[from][movieIndex]) {
            const movie = searchResultsCache[from][movieIndex];
            
            try {
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
            } catch (fetchError) {
                console.error('Fetch Error:', fetchError);
                await reply("❌ Failed to fetch movie details. Please try again.");
            }
        } else {
            await reply("❌ Invalid movie index. Please try again.");
        }
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});

// Extract titles from search results HTML
function extractTitles(html) {
    const $ = cheerio.load(html);
    const results = [];

    $('h2.post-box-title a').each((index, element) => {
        const url = $(element).attr('href');
        const title = $(element).text().replace(/Subtitles.*/, "Subtitles").trim();
        
        if (url && title) {
            results.push({ url, title });
        }
    });

    return results;
}

// Sanitize movie titles
function sanitizeTitle(title) {
    return title.replace(/[^A-Za-z0-9\s]/g, "").trim();
}

// Get movie poster URL
async function getPosterImageUrl(pageUrl) {
    try {
        const { data: text } = await axios.get(pageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(text);
        const posterUrl = $('img.attachment-slider.size-slider.wp-post-image').attr('src');
        const descriptionText = $('.neon').text().trim() || "Description Not Found";

        if (posterUrl) {
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
        const { data: text } = await axios.get(pageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(text);
        const downloadLink = $('#btn-download').attr('data-link');

        return downloadLink || null;
    } catch (error) {
        console.error("Error fetching download link:", error);
        return null;
    }
}

// Get movie name
async function getMovieName(pageUrl) {
    try {
        const { data: text } = await axios.get(pageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(text);
        const movieName = $('h1.name.post-title.entry-title span[itemprop="name"]').text().trim();

        return movieName || "Unknown Movie";
    } catch (error) {
        console.error("Error fetching movie name:", error);
        return "Unknown Movie";
    }
}

module.exports = { cmd };
