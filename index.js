// index.js
import express from "express";
import fetch from "node-fetch";

// ======================
// Config Telegram (variabili ambiente su Render)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// ======================
// Inizializza app
const app = express();
app.use(express.json());

// ======================
// Route di test ping (UptimeRobot)
app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

// ======================
// Funzione invio Telegram
const sendTelegram = async (message) => {
  if (!TELEGRAM_TOKEN || !CHAT_ID) return;
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: false
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
    const { pair, score, zone, text, link } = req.body;

    if (!pair || score == null || !zone || !link || !text) {
      res.status(400).send("Parametri mancanti");
      return;
    }

    // Emoji in base alla zona
    const emoji = zone == 70 ? "🔻 SHORT" : "🚀 LONG";

    // Messaggio formattato HTML
    const message = `
<b>${emoji} - Exhaustion Alert</b>
Pair: <b>${pair}</b>
Score: <b>${score.toFixed(1)}</b>
Zone: <b>${zone}</b>
${text}
📊 Grafico: <a href="${link}">TradingView</a>
    `;

    await sendTelegram(message);

    console.log("Webhook ricevuto:", req.body);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Errore handling webhook:", err);
    res.status(500).send("Server error");
  }
});

// ======================
// Porta dinamica Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
