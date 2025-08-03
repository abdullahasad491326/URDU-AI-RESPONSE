const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const API_KEY = "AIzaSyBHNYHRtGVxs7N0YgJuOUL0dNwGqqrZYXs";  // YOUR GOOGLE GEMINI KEY

app.post('/chat', async (req, res) => {
  const userMsg = req.body.message;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY,
      { contents: [{ parts: [{ text: userMsg }] }] }
    );

    const reply = response.data.candidates[0]?.content?.parts[0]?.text || "جواب دستیاب نہیں۔";
    res.json({ reply });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ reply: "⚠️ سرور میں خرابی ہوئی۔" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
