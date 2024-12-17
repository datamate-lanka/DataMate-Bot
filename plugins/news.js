const Esana = require('@sl-code-lords/esana-news');
const { cmd, commands } = require('../command');

var api = new Esana();

cmd({
    pattern: "news",
    desc: "Get the latest news.",
    category: "main",
    filename: __filename
},
async(conn, mek, m, { from, quoted, reply }) => {
    try {
        // Fetch the latest news ID
        const latestNewsId = await api.latest_id();
        if (latestNewsId && latestNewsId.results && latestNewsId.results.news_id) {
            // Get the latest news details
            const newsDetails = await api.news(latestNewsId.results.news_id);

            if (newsDetails && newsDetails.TITLE) {
                // Prepare the message
                const caption = `📰 *Latest News:*\n\n*Title:* ${newsDetails.TITLE}\n\n*Published:* ${newsDetails.PUBLISHED}\n\n*Description:* ${newsDetails.full_news}\n\n[Read more](${newsDetails.URL})`;

                // Send the news message with the cover image
                return await conn.sendMessage(from, {
                    image: { url: newsDetails.COVER },
                    caption: caption
                }, { quoted: mek });
            } else {
                reply("Sorry, no news details were found.");
            }
        } else {
            reply("Could not fetch the latest news ID.");
        }
    } catch (e) {
        console.error(e);
        reply(`An error occurred: ${e.message}`);
    }
});
