const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/ask', async (req, res) => {
  try {
    const messages = [
      { role: "user", content: "کیا حال ہے" },
      { role: "assistant", content: "**میں بالکل ٹھیک ہوں!** آپ کیسے ہیں؟" },
      { role: "user", content: req.body.message }
    ];

    const response = await axios.post("https://wewordle.org/gptapi/v1/web/turbo", {
      messages: messages
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    res.json({ answer: response.data?.result?.content || "کوئی جواب نہیں آیا۔" });
  } catch (err) {
    res.status(500).json({ error: "API مسئلہ: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
