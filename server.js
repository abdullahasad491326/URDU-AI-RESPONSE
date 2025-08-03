const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.static(__dirname));
app.use(express.json());

const API_KEY = "AIzaSyBHNYHRtGVxs7N0YgJuOUL0dNwGqqrZYXs"; // Your key

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const gptRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/chat-bison-001:generateMessage?key=" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: { messages: [{ author: "user", content: userMessage }] },
        temperature: 0.7
      })
    });

    const json = await gptRes.json();
    const reply = json.candidates?.[0]?.content || "❌ کوئی جواب نہیں آیا";
    res.json({ reply });
  } catch (err) {
    res.json({ reply: "⚠️ سرور سے رابطہ ممکن نہیں۔" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server running on port " + PORT));
