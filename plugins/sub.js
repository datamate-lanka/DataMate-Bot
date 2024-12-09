const config = require('../config');
const { cmd, commands } = require('../command');
const axios = require('axios');  // Ensure you have axios required here

// Fixing the fetchJson function
const fetchJson = async (url, options) => {
    try {
        options = options || {};  // Ensure options default to an empty object
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        });
        return res.data;  // Return the JSON data directly
    } catch (err) {
        console.log(err);  // Log any error to the console for debugging
        return { status: 'error', message: 'Something went wrong' };  // Return an error message
    }
};

cmd({
    pattern: "sub",
    desc: "cineru.lk sub download",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Make sure the query parameter 'q' is passed correctly
        if (!q) {
            return reply('Please provide a subtitle query.');
        }

        // Fetch data from the API
        let data = await fetchJson(`https://cinerulk-fetch.mahagedara-co.workers.dev/?sub=${q}`);
        
        // Check if data has the correct structure
        if (data.status === 'success ✅') {
            return reply(`${data.data}`);  // Reply with the subtitle information
        } else {
            return reply('No subtitle data found for your query.');
        }
    } catch (e) {
        console.log(e);  // Log any error to the console
        return reply('An error occurred while fetching the subtitle data.');
    }
});
