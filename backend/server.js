const express = require('express');
const cors = require('cors');
require('./cron-tasks'); // Start background processes

const app = express();
app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({ status: "running", project: "ipo-result-checker-30c91" });
});

app.listen(5000, () => {
    console.log("🚀 Backend syncing to Firebase Realtime Database (SE Asia Region)");
});