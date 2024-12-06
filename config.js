const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID,
    ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/BywLs0t/Any-Conv-com-15b52-1qaglhqizubs8tnecxh8ixg.png",
    ALIVE_MSG: process.env.ALIVE_MSG || "I'm Alive Now",
};
