const config = require('../config');
const { cmd, commands } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

cmd({
    pattern: "search",
    desc: "Search for Sinhala subtitles.",
    category: "subtitles",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args.length) return reply("Please provide a movie name to search for!");

        const keyword = args.join(" ");
        const searchUrl = `https://cineru.lk/?s=${encodeURIComponent(keyword)}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);

        const results = [];
        $(".post-listing.archive-box .item-list").each((i, el) => {
            const title = $(el).find("h2.post-box-title a").text();
            const link = $(el).find("h2.post-box-title a").attr("href");
            results.push({ title, link });
        });

        if (!results.length) {
            return reply("No results found for your search. Try another keyword.");
        }

        let message = `Search Results for "${keyword}":\n\n`;
        results.forEach((result, index) => {
            message += `${index + 1}. ${result.title}\n`;
        });
        message += `\nReply with the number to download the subtitles.`;

        conn.sendMessage(from, { text: message }, { quoted: mek });

        // Store the results in memory for the next interaction
        config.searchResults[from] = results;

    } catch (error) {
        console.error(error);
        reply("An error occurred while searching for subtitles. Please try again later.");
    }
});

cmd({
    pattern: "choose",
    desc: "Download Sinhala subtitles.",
    category: "subtitles",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args.length) return reply("Please provide the movie number to download subtitles!");

        const choice = parseInt(args[0]);
        const results = config.searchResults[from];
        if (!results || !results[choice - 1]) {
            return reply("Invalid choice or no search results available. Please search again.");
        }

        const movieUrl = results[choice - 1].link;
        const { data } = await axios.get(movieUrl);
        const $ = cheerio.load(data);

        const downloadLink = $('#btn-download').data('link');
        if (!downloadLink) {
            return reply("Subtitle download link not found on the movie page.");
        }

        const fileName = downloadLink.split('/').pop();
        conn.sendMessage(from, {
            document: { url: downloadLink },
            mimetype: 'application/zip',
            fileName: fileName
        }, { quoted: mek });
    } catch (error) {
        console.error(error);
        reply("An error occurred while downloading subtitles. Please try again later.");
    }
});
