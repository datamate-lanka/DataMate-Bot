const express = require("express");
const fs = require("fs");
const path = require("path");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const app = express();
const port = process.env.PORT || 8000;

const ownerNumber = ["94785760531"];
const prefix = ".";

async function connectToWA() {
  console.log("Connecting wa bot 🧬...");
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/session_file_here/");
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version,
  });

  conn.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === "open") {
      console.log("✅ Bot connected to WhatsApp");
    }
  });

  conn.ev.on("creds.update", saveCreds);
}

// ** Vercel doesn't allow long-running processes, so we return a response **
app.get("/", (req, res) => {
  res.send("Hello, WhatsApp Bot API is running on Vercel ✅");
});

// ** Deployment on Vercel should NOT start the bot, use an external server **
module.exports = app;

// If running locally, start bot
if (require.main === module) {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  setTimeout(connectToWA, 4000);
}
