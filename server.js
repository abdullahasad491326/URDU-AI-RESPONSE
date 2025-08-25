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

        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            headers: {
                "Host": "dpview.ilyashassan4u.workers.dev",
                'sec-ch-ua-platform': '"Android"',
                "user-agent": "Mozilla/5.0 (Linux; Android 12; CPH2127 Build/RKQ1.211119.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.7258.94 Mobile Safari/537.36",
                'sec-ch-ua': '"Not;A=Brand";v="99", "Android WebView";v="139", "Chromium";v="139"',
                "sec-ch-ua-mobile": "?1",
                "accept": "*/*",
                "origin": "https://www.trickyworlds.com",
                "x-requested-with": "mark.via.gp",
                "sec-fetch-site": "cross-site",
                "sec-fetch-mode": "cors",
                "sec-fetch-dest": "empty",
                "referer": "https://www.trickyworlds.com/",
                "accept-language": "en-PK,en-US;q=0.9,en;q=0.8",
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

// ================== Serve Profile.html ==================
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Profile.html'));
});

// ================== Admin Configuration ==================
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
    if (blockedIPs.has(req.ip)) {
        return res.status(403).json({ error: 'Your IP is blocked by admin.' });
    }
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
    const number = req.query.number;
    if (!number) {
        return res.status(400).json({ error: 'Number parameter missing' });
    }
    try {
        const apiRes = await fetch(`https://www.easyload.com.pk/dingconnect.php?action=GetProviders&accountNumber=${number}`);
        if (!apiRes.ok) throw new Error('API request failed');
        const data = await apiRes.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// ================== CNIC and Mobile Search ==================
app.post('/search-data', async (req, res) => {
    const mobileNumber = req.body.mobileNumber;
    const cnicNumber = req.body.cnicNumber;

    let searchParam = '';
    let isCnicSearch = false;

    if (mobileNumber && /^03\d{9}$/.test(mobileNumber)) {
        searchParam = mobileNumber;
        isCnicSearch = false;
    } else if (cnicNumber && /^\d{13}$/.test(cnicNumber)) {
        searchParam = cnicNumber;
        isCnicSearch = true;
    } else {
        return res.status(400).json({ error: 'Invalid or missing mobile number or CNIC' });
    }
    
    // Determine the API endpoint based on the search type
    const endpoint = isCnicSearch ? 'https://minahilsimsdata.pro/cnic-search.php' : 'https://minahilsimsdata.pro/search.php';
    const body = isCnicSearch ? { cnicNumber: searchParam } : { mobileNumber: searchParam };
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'https://minahilsimsdata.pro/',
                'Origin': 'https://minahilsimsdata.pro'
            },
            body: new URLSearchParams(body)
        });
        
        const text = await response.text();
        
        if (text.includes('Data Not Found')) {
            return res.status(404).json({ error: 'Data Not Found' });
        }
        
        const dom = new JSDOM(text);
        const cells = [...dom.window.document.querySelectorAll('td')].map(td => td.textContent.trim()).filter(Boolean);
        
        const cnic = cells.find(c => /^\d{13}$/.test(c));
        if (!cnic) return res.status(404).json({ error: 'CNIC not found' });
        
        const cnicIndex = cells.indexOf(cnic);
        const name = cells.slice(1, cnicIndex).join(' ');
        const address = cells.slice(cnicIndex + 1).join(' ');
        
        res.json({ name, cnic, address });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ================== Send SMS ==================
app.post('/send-sms', (req, res) => {
    const { mobile, message } = req.body;
    const ip = req.ip;

    if (!mobile || !/^03\d{9}$/.test(mobile)) {
        return res.status(400).json({ error: 'Invalid or missing mobile number' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
    }

    resetIpCountsIfNeeded(ip);
    if (ipSmsCount[ip].count >= SMS_LIMIT_PER_IP_PER_DAY) {
        return res.status(429).json({ error: `SMS limit reached: max ${SMS_LIMIT_PER_IP_PER_DAY} messages per day per IP.` });
    }

    const formattedMobile = mobile.startsWith("0") ? "92" + mobile.slice(1) : mobile;
    
    smsLogs.push({ ip, mobile: formattedMobile, message, timestamp: new Date().toISOString(), type: 'send-sms' });
    ipSmsCount[ip].count++;

    console.log('Simulated SMS sent successfully:', { mobile: formattedMobile, message });
    console.log('New log added. Current smsLogs:', smsLogs);

    res.json({ success: true, message: "SMS logged successfully." });
});

// ================== Admin APIs ==================
app.get('/api/admin/logs', (req, res) => {
    res.json({ success: true, logs: smsLogs });
});

let serviceStatus = true;
app.get('/api/admin/status', (req, res) => {
    res.json({ success: true, status: serviceStatus });
});

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

app.get('/api/admin/blocked-ips', (req, res) => {
    res.json({ success: true, blockedIps: Array.from(blockedIPs) });
});

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
    console.log(`➡️ Operator UI: http://localhost:${PORT}/`);
    console.log(`➡️ Admin Panel: http://localhost:${PORT}/admin`);
});
    
