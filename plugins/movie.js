const config = require('../config')
const {cmd , commands} = require('../command')
const { sinhalaSub } = require("mrnima-moviedl");

cmd(
    {
        pattern: "movie", // Command pattern එක
        desc: "Search movies with Sinhala subtitles", // Command විස්තරය
        category: "main", // Command category එක
        filename: __filename, // Command file එකේ නම
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            quoted,
            args,
            q,
            isCmd,
            reply, // Reply message sending function
        }
    ) => {
        try {
            if (!q) {
                return reply("කරුණාකර චිත්‍රපටයේ නමක් ලබාදෙන්න! 🎥"); // Prompt for movie name
            }

            const movie = await sinhalaSub(); // SinhalaSub API එක initialize කරන්න
            const result = await movie.search(q); // Movie එක සෙවීම

            if (!result.status || !result.result.length) {
                return reply("සෙවීමෙන් ගැලපෙන කිසිවක් හමු නොවිනි! 😞");
            }

            const movies = result.result
                .map(
                    (item, index) =>
                        `*${index + 1}. ${item.title}*\n🔗 Link: ${item.link}\n📷 Image: ${item.img}\n`
                )
                .join("\n");

            reply(`🎬 *Movie Search Results* 🎬\n\n${movies}`); // Search results display කරන්න
        } catch (error) {
            console.error("Error:", error);
            reply("දෝෂයක් ඇතිවිය! කරුණාකර පසුව උත්සහ කරන්න.");
        }
    }
);

