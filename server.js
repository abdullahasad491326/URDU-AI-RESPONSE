const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ================== ChatGPT Proxy ==================
app.post('/api/chat', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "❌ No text provided" });
        }

        const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`);
        res.json(response.data);

    } catch (err) {
        console.error("Chat API Error:", err.message);
        res.status(500).json({ error: "❌ Failed to fetch AI response" });
    }
});

// ================== DP Viewer Proxy ==================
app.get('/api/dp', async (req, res) => {
    try {
        const phone = req.query.phone;
        if (!phone) {
            return res.status(400).json({ error: "❌ Phone number required" });
        }

        const apiUrl = `https://dpview.ilyashassan4u.workers.dev/?phone=${encodeURIComponent(phone)}`;
        const response = await axios.get(apiUrl);

        res.set("Access-Control-Allow-Origin", "*");
        res.send(response.data);

    } catch (err) {
        console.error("DP API Error:", err.message);
        res.status(500).json({ error: "❌ Failed to fetch DP" });
    }
});

// ================== Serve Profile.html ==================
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Profile.html'));
});

// ================== Start Server ==================
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
    console.log(`➡️ ChatGPT UI: http://localhost:${PORT}/`);
    console.log(`➡️ DP Viewer UI: http://localhost:${PORT}/profile`);
});
