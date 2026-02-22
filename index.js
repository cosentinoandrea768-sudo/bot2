// index.js
const express = require("express");
const fetch = require("node-fetch");

// ======================
// Config Telegram (imposta su Render)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // Bot token
const CHAT_ID = process.env.CHAT_ID;               // Chat ID

// ======================
// Inizializza app
const app = express();
app.use(express.json()); // parser JSON obbligatorio

// ======================
// Route di test ping per UptimeRobot
app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

// ======================
// Funzione invio Telegram
const sendTelegram = async (message) => {
  if (!TELEGRAM_TOKEN || !CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML"
      })
    });
  } catch (err) {
    console.error("Errore invio Telegram:", err);
  }
};

// ======================
// Route Webhook TradingView
app.post("/webhook-tv", async (req, res) => {
  try {
    const { side, ticker, entryPrice, exitPrice, pips, rrRatio, zone } = req.body;

    if (!ticker || !side) {
      res.status(400).send("Missing parameters");
      return;
    }

    let message = "";
    const pipsStr = pips != null ? (Math.round(pips * 10) / 10).toFixed(1) : null;

    if (exitPrice == null) {
      // Apertura trade
      message = `${side === "LONG" ? "🚀 LONG" : "🔻 SHORT"} ENTRY\nPair: ${ticker}\nPrice: ${entryPrice}`;
    } else {
      // Chiusura trade
      message = `${side === "LONG" ? "🚀 LONG" : "🔻 SHORT"} EXIT\nPair: ${ticker}\nPrice: ${exitPrice}\nPips: ${pipsStr} | RR: ${rrRatio}`;
    }

    await sendTelegram(message);
    console.log("Webhook received:", req.body);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Error handling webhook:", err);
    res.status(500).send("Server error");
  }
});

// ======================
// Porta dinamica Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
