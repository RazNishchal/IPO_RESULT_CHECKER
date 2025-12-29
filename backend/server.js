const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Note: In Vercel, this memory is cleared often. 
// For high-speed mass checking, we keep it, but it's best for single checks.
let sessions = {};

// 1. Get the list of available IPOs
app.get('/api/companies', async (req, res) => {
    try {
        const response = await axios.post('https://iporesult.cdsc.com.np/result/company/all');
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch companies from CDSC" });
    }
});

// 2. Fetch a new captcha
app.get('/api/captcha/:id', async (req, res) => {
    try {
        const response = await axios.get('https://iporesult.cdsc.com.np/result/captcha/image/initial');

        // Save the session cookie using the ID passed from frontend
        sessions[req.params.id] = response.headers['set-cookie'];

        // CDSC sends the captcha as a base64 string in the body now, 
        // but if they send binary, your Buffer logic is correct.
        const captchaData = response.data.image ? response.data.image :
            `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

        res.json({ image: captchaData });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch captcha" });
    }
});

// 3. Post the result check
app.post('/api/check', async (req, res) => {
    const { id, boid, companyId, captcha } = req.body;

    if (!sessions[id]) {
        return res.status(400).json({ message: "Session expired. Reload captcha." });
    }

    try {
        const response = await axios.post('https://iporesult.cdsc.com.np/result/result/check', {
            boid,
            companyShareId: companyId,
            userCaptcha: captcha
        }, {
            headers: {
                'Cookie': sessions[id].join('; '),
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (err) {
        // Clear session on failure to force a new captcha
        delete sessions[id];
        res.status(400).json({ message: "Invalid Captcha or Network Error" });
    }
});

// Important for Vercel: Only listen if running locally
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel
module.exports = app;