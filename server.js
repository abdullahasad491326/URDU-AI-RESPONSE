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

// ================== DP Viewer Proxy ==================
app.get('/api/dp', async (req, res) => {
    try {
        const phone = req.query.phone;
        if (!phone) return res.status(400).json({ error: "❌ Phone number required" });

        const apiUrl = `https://dpview.ilyashassan4u.workers.dev/?phone=${encodeURIComponent(phone)}`;
        const userAgents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
            "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
        ];
        const platforms = ['Windows', 'Macintosh', 'Linux', 'iPhone', 'Android'];
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];

        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            headers: {
                "Host": "dpview.ilyashassan4u.workers.dev",
                "user-agent": randomUA,
                "sec-ch-ua-platform": `"${randomPlatform}"`,
                "sec-ch-ua-mobile": randomPlatform === "Android" || randomPlatform === "iPhone" ? "?1" : "?0",
                "accept": "*/*",
                "origin": "https://www.trickyworlds.com",
                "x-requested-with": "XMLHttpRequest",
                "sec-fetch-site": "cross-site",
                "sec-fetch-mode": "cors",
                "sec-fetch-dest": "empty",
                "referer": "https://www.trickyworlds.com/",
                "accept-language": "en-US,en;q=0.9",
                "priority": "u=1, i"
            }
        });

        res.set("Content-Type", response.headers["content-type"] || "image/jpeg");
        res.send(response.data);
    } catch (err) {
        console.error("DP API Error:", err.message);
        res.status(500).json({ error: "❌ Failed to fetch DP" });
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

// ================== Admin Config ==================
const ADMIN_USERNAME = 'PAKCYBER';
const ADMIN_PASSWORD = '82214760';

// ================== Limits and Storage ==================
const SMS_LIMIT_PER_IP_PER_DAY = 3;
const smsLogs = [];
const ipSmsCount = {};
const blockedIPs = new Set();

function resetIpCountsIfNeeded(ip) {
    const now = new Date();
    if (!ipSmsCount[ip]) {
        ipSmsCount[ip] = { count: 0, lastReset: now };
    } else {
        const lastReset = ipSmsCount[ip].lastReset;
        if (
            now.getFullYear() !== lastReset.getFullYear() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getDate() !== lastReset.getDate()
        ) {
            ipSmsCount[ip].count = 0;
            ipSmsCount[ip].lastReset = now;
        }
    }
}

// --- IP Block Middleware ---
app.use((req, res, next) => {
    if (blockedIPs.has(req.ip)) return res.status(403).json({ error: 'Your IP is blocked by admin.' });
    next();
});

// ================== Operator Home ==================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Operator.html'));
});

// ================== Admin Login ==================
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
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
// ================== CNIC and Mobile Search ==================
app.post('/search-data', async (req, res) => {
    const { mobileNumber, cnicNumber } = req.body;
    let searchParam = '';

    if (mobileNumber && /^03\d{9}$/.test(mobileNumber)) searchParam = '92' + mobileNumber.slice(1);
    else if (mobileNumber && /^923\d{9}$/.test(mobileNumber)) searchParam = mobileNumber;
    else if (cnicNumber && /^\d{13}$/.test(cnicNumber)) searchParam = cnicNumber;
    else return res.status(400).json({ error: '❌ Invalid or missing mobile number or CNIC' });

    try {
        const apiUrl = `https://allnetworkdata.com/?number=${encodeURIComponent(searchParam)}`;
        const response = await axios.get(apiUrl);
        res.json({ success: true, searchParam, data: response.data });
    } catch (error) {
        console.error('Search API Error:', error.message);
        res.status(500).json({ error: '❌ Failed to fetch search data' });
    }
});

// ================== Send SMS ==================
app.post('/send-sms', (req, res) => {
    const { mobile, message } = req.body;
    const ip = req.ip;

    if (!mobile || !/^03\d{9}$/.test(mobile)) return res.status(400).json({ error: 'Invalid or missing mobile number' });
    if (!message || typeof message !== 'string' || message.trim().length === 0) return res.status(400).json({ error: 'Message is required' });

    resetIpCountsIfNeeded(ip);
    if (ipSmsCount[ip].count >= SMS_LIMIT_PER_IP_PER_DAY) return res.status(429).json({ error: `SMS limit reached: max ${SMS_LIMIT_PER_IP_PER_DAY} messages per day per IP.` });

    const formattedMobile = mobile.startsWith("0") ? "92" + mobile.slice(1) : mobile;

    smsLogs.push({ ip, mobile: formattedMobile, message, timestamp: new Date().toISOString(), type: 'send-sms' });
    ipSmsCount[ip].count++;

    console.log('Simulated SMS sent successfully:', { mobile: formattedMobile, message });
    res.json({ success: true, message: "SMS logged successfully." });
});

// ================== Admin APIs ==================
app.get('/api/admin/logs', (req, res) => res.json({ success: true, logs: smsLogs }));

let serviceStatus = true;

app.get('/api/admin/status', (req, res) => res.json({ success: true, status: serviceStatus }));
app.post('/api/admin/toggle-sms', (req, res) => {
    serviceStatus = !serviceStatus;
    res.json({ success: true, status: serviceStatus });
});

app.post('/api/admin/block-ip', (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP is required' });
    blockedIPs.add(ip);
    res.json({ success: true, blockedIPs: Array.from(blockedIPs) });
});

app.post('/api/admin/unblock-ip', (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP is required' });
    blockedIPs.delete(ip);
    res.json({ success: true, blockedIPs: Array.from(blockedIPs) });
});

app.get('/api/admin/blocked-ips', (req, res) => res.json({ success: true, blockedIps: Array.from(blockedIPs) }));

app.get('/api/admin/stats', (req, res) => {
    const totalMessages = smsLogs.length;
    const uniqueIps = new Set(smsLogs.map(log => log.ip));
    const totalVisitors = uniqueIps.size;
    res.json({ success: true, totalMessages, totalVisitors });
});

// ================== Start Server ==================
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
    console.log(`➡️ ChatGPT UI: http://localhost:${PORT}/`);
    console.log(`➡️ DP Viewer UI: http://localhost:${PORT}/profile`);
    console.log(`➡️ TikTok Downloader UI: http://localhost:${PORT}/tiktok`);
    console.log(`➡️ Operator UI: http://localhost:${PORT}/`);
    console.log(`➡️ Admin Panel: http://localhost:${PORT}/admin`);
});
