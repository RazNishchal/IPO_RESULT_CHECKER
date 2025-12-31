const cron = require('node-cron');
const db = require('./firebase-config');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 🚀 CORE FUNCTION: Syncs market data.
 * Includes 'name' extraction from the 'title' attribute of the symbol link.
 */
async function syncMarketData() {
    const now = new Date();
    console.log(`[${now.toLocaleTimeString()}] 🔄 Syncing market data to Firebase...`);

    try {
        const { data } = await axios.get("https://merolagani.com/latestmarket.aspx");
        const $ = cheerio.load(data);
        const updates = {};

        // Fetch existing market data first to preserve static info (Sector)
        const currentMarketSnap = await db.ref('market').get();
        const existingData = currentMarketSnap.val() || {};

        $('.table-hover tbody tr').each((i, el) => {
            const tds = $(el).find('td');
            const symbolAnchor = $(tds[0]).find('a');
            const symbol = symbolAnchor.text().trim().toUpperCase();

            // ⚡ THE FIX: Extract the Full Company Name from the 'title' attribute
            const companyName = symbolAnchor.attr('title') ? symbolAnchor.attr('title').trim() : symbol;

            if (symbol && symbol !== "SYMBOL") {
                const ltp = parseFloat($(tds[1]).text().replace(/,/g, '')) || 0;
                const percentChange = parseFloat($(tds[2]).text()) || 0;
                const prevClose = parseFloat($(tds[3]).text().replace(/,/g, '')) || 0;
                const pointChange = Number((ltp - prevClose).toFixed(2));

                // Path: market/SYMBOL
                updates[`market/${symbol}`] = {
                    ...(existingData[symbol] || {}), // Keep sector if already exists
                    symbol: symbol,
                    name: companyName, // ⚡ Pushing Full Company Name
                    ltp: ltp,
                    percentChange: percentChange,
                    previousClose: prevClose,
                    pointChange: pointChange,
                    lastUpdated: now.toISOString()
                };
            }
        });

        // Atomic update at root
        await db.ref().update(updates);
        console.log(`✅ Success! ${Object.keys(updates).length} companies updated with full names.`);
    } catch (err) {
        console.error("❌ Scraper Error:", err.message);
    }
}

// --- ⚡ PHASE 1: IMMEDIATE UPDATE ---
console.log("🚀 Initializing Immediate Database Sync...");
syncMarketData();

// --- 📅 PHASE 2: TIMELY UPDATION (Cron Schedule) ---
cron.schedule('* * * * 0-4', async () => {
    const now = new Date();
    const time = now.getHours() * 100 + now.getMinutes();

    if (time >= 1055 && time <= 1505) {
        console.log("⏰ Scheduled Market Update Triggered...");
        await syncMarketData();
    }
}, {
    timezone: "Asia/Kathmandu"
});

console.log("🛠️ Scraper service is running in background...");