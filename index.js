import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post("/webhook-tv", async (req, res) => {
  try {
    const { ticker, exchange, interval, score, zone } = req.body || {};

    const tvSymbol = `${exchange}:${ticker}`;
    const tvLink = `https://www.tradingview.com/chart/?symbol=${tvSymbol}`;

    const message = `
📊 ${tvSymbol}
⏰ ${interval}
📈 Score: ${parseFloat(score).toFixed(2)}
⚠️ Zona ${zone}

🔗 Apri grafico: ${tvLink}
    `;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });

    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/", (req, res) => res.send("Bot is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
