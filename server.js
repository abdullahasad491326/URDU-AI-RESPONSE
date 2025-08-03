const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI("AIzaSyBHNYHRtGVxs7N0YgJuOUL0dNwGqqrZYXs");

app.use(cors());
app.use(bodyParser.json());

app.post('/ask', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "⚠️ سرور پر خرابی ہوئی" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
