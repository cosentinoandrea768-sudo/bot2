import express from "express";

const app = express();
app.use(express.json());

// --------------------
// HEALTH CHECK
// --------------------
app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

// --------------------
// WEBHOOK TRADINGVIEW
// --------------------
app.post("/webhook-tv", async (req, res) => {
  try {
    const data = req.body;

    console.log("Webhook ricevuto:", data);

    if (!data || !data.pair) {
      return res.status(400).send("Invalid payload");
    }

    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      console.error("Variabili ambiente mancanti");
      return res.status(500).send("Server config error");
    }

    const message = `
🚨 Swing Trend Exhaustion Alert

📊 Pair: ${data.pair}
📈 Score: ${data.score}
🎯 Zona: ${data.zone}

${data.text}
`;

    const telegramURL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    await fetch(telegramURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      }),
    });

    res.status(200).send("OK");
  } catch (error) {
    console.error("Errore webhook:", error);
    res.status(500).send("Error");
  }
});

// --------------------
// START SERVER
// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
