const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

// It is best practice to check if already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://ipo-result-checker-30c91-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
}

const db = admin.database();
module.exports = db;