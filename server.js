const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;

// ================== Middlewares ==================
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ================== ChatGPT Proxy ==================
app.post('/api/chat', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "❌ No text provided" });

    const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`);
    res.json(response.data);
  } catch (err) {
    console.error("Chat API Error:", err.message);
    res.status(500).json({ error: "❌ Failed to fetch AI response" });
  }
});

// ================== TikTok Downloader Proxy ==================
app.post("/api/tiktok", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "❌ No TikTok URL provided" });

    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    ];
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

    const response = await axios.post(
      "https://savetik.co/api/ajaxSearch",
      new URLSearchParams({ q: url, lang: "en" }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": randomUA,
          "X-Requested-With": "XMLHttpRequest",
          "Origin": "https://savetik.co",
          "Referer": "https://savetik.co/en2",
        },
      }
    );

    const dom = new JSDOM(response.data.data || "");
    const document = dom.window.document;

    const downloads = [];
    document.querySelectorAll("a").forEach(a => {
      const link = a.href;
      const type = a.textContent.trim();
      if (link) downloads.push({ type, link });
    });

    res.json({ success: true, url, downloads });
  } catch (err) {
    console.error("TikTok API Error:", err.message);
    res.status(500).json({ error: "❌ Failed to fetch TikTok video" });
  }
});

// ================== Serve TikTok.html ==================
app.get('/tiktok', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'TikTok.html'));
});

// ================== Operator Home ==================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Operator.html'));
});

// ================== Operator Check ==================
app.get('/proxy', async (req, res) => {
  let number = req.query.number;
  if (!number) return res.status(400).json({ error: 'Number parameter missing' });

  number = number.trim();
  if (/^03\d{9}$/.test(number)) number = '92' + number.slice(1);
  else if (!/^923\d{9}$/.test(number)) {
    if (/^\d{11}$/.test(number) && number.startsWith('3')) number = '92' + number;
    else return res.status(400).json({ error: 'Invalid number format' });
  }

  try {
    const apiUrl = `https://cliqntalk.daraldhabikitchen.com/crm/webapi.asmx/GetProviders?countryIsos=pk&regionCodes=pk&accountNumber=${encodeURIComponent(number)}&benefits=&providerCodes=`;

    const response = await axios.get(apiUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "*/*",
        "origin": "https://www.cliqntalk.com",
        "referer": "https://www.cliqntalk.com/",
        "x-requested-with": "mark.via.gp"
      },
      timeout: 15000
    });

    let data = response.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { data = { raw: response.data }; }
    }

    res.json({ success: true, number, providerData: data });
  } catch (error) {
    console.error("Operator API Error:", error.message);
    res.status(500).json({ error: 'Failed to fetch operator data' });
  }
});

// ================== Electricity Bill Proxy ==================
app.post('/api/bill', async (req, res) => {
  const { refNo } = req.body;
  if (!refNo) return res.status(400).json({ status: false, message: "refNo required" });

  try {
    const response = await fetch("https://bill.pitc.com.pk/bill/info", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json; utf-8",
        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 11; Pixel 4 Build/RD2A.211001.002)",
        "Host": "bill.pitc.com.pk",
        "Connection": "Keep-Alive",
        "Accept-Encoding": "gzip"
      },
      body: JSON.stringify({
        refNo: refNo,
        secret_token: "token_4rpak_security",
        app_name: "RoshanPakistan"
      })
    });

    const data = await response.json();
    if (!data || data.status === false) return res.json({ status: false, message: "❌ Error fetching data or invalid reference number" });

    res.json(data);
  } catch (err) {
    console.error("Bill API Error:", err.message);
    res.status(500).json({ status: false, message: "❌ Error fetching data from PITC API" });
  }
});

// ================== Start Server ==================
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log(`➡️ ChatGPT UI: http://localhost:${PORT}/`);
  console.log(`➡️ TikTok Downloader UI: http://localhost:${PORT}/tiktok`);
  console.log(`➡️ Operator UI: http://localhost:${PORT}/`);
  console.log(`➡️ Electricity Bill UI: http://localhost:${PORT}/`);
});
