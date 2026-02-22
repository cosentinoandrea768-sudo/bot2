import express from "express";
import fetch from "node-fetch";

// Config Telegram
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

const sendTelegram = async (message) => {
  if (!TELEGRAM_TOKEN || !CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: "HTML" })
  });
};

app.post("/webhook-tv", async (req, res) => {
  try {
    const { side, ticker, entryPrice, exitPrice, pips, rrRatio, zone } = req.body;
    if (!ticker || !side) return res.status(400).send("Missing parameters");

    let message = exitPrice == null
      ? `${side === "LONG" ? "🚀 LONG" : "🔻 SHORT"} ENTRY\nPair: ${ticker}\nPrice: ${entryPrice}`
      : `${side === "LONG" ? "🚀 LONG" : "🔻 SHORT"} EXIT\nPair: ${ticker}\nPrice: ${exitPrice}\nPips: ${pips != null ? (Math.round(pips*10)/10).toFixed(1) : "N/A"} | RR: ${rrRatio}`;

    await sendTelegram(message);
    console.log("Webhook received:", req.body);
    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
