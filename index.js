import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

app.post("/webhook-tv", (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
