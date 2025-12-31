import { db } from '../firebase';
import { ref, push, update, onValue, get } from "firebase/database";

/**
 * ⚡ SAFE REAL-TIME MARKET LISTENER
 */
export const listenToMarketData = (callback) => {
    const marketRef = ref(db, 'market');
    return onValue(marketRef, (snapshot) => {
        callback(snapshot.val() || {});
    }, (error) => {
        console.error("Firebase Market Sync Error:", error);
    });
};

/**
 * Listens to real-time changes in user holdings
 */
export const listenToPortfolio = (userId, callback) => {
    if (!userId) return;
    const holdingsRef = ref(db, `users/${userId}/holdings`);
    return onValue(holdingsRef, (snapshot) => {
        callback(snapshot.val() || {});
    });
};

/**
 * Updates Portfolio, Market Data, and Transactions.
 * ⚡ FIX: Forces companyName to exist in DB under correct keys.
 */
export const updatePortfolioInDB = async (userId, tx, currentHoldings = {}, marketData = {}) => {
    const symbol = tx.symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const txUnits = parseInt(tx.units);
    const txPrice = parseFloat(tx.price);

    // Get existing market data from local state
    const mData = marketData[symbol] || {};

    // ⚡ IMPROVED NAME LOOKUP
    // We check every possible source to ensure we don't push 'undefined'
    const companyName =
        tx.companyName ||
        mData.name ||
        mData.companyName ||
        currentHoldings[symbol]?.companyName ||
        symbol;

    const current = currentHoldings[symbol] || { units: 0, wacc: 0 };
    let newUnits, newWacc;

    if (tx.type === 'BUY') {
        newUnits = current.units + txUnits;
        const totalCost = (current.units * (current.wacc || 0)) + (txUnits * txPrice);
        newWacc = totalCost / newUnits;
    } else {
        if (current.units < txUnits) throw new Error("Insufficient Units");
        newUnits = current.units - txUnits;
        newWacc = current.wacc;
    }

    const updates = {};
    const timestamp = Date.now();
    const formattedDate = new Date(timestamp).toISOString();

    // --- 1. GLOBAL MARKET UPDATE ---
    // This updates the 'market' node so Gainers/Losers list shows the name
    updates[`market/${symbol}`] = {
        ...mData,
        symbol: symbol,
        name: companyName, // Field key is 'name' in market node
        ltp: txPrice,
        lastUpdated: formattedDate,
        pointChange: mData.pointChange || 0,
        percentChange: mData.percentChange || 0
    };

    // --- 2. USER HOLDINGS UPDATE ---
    // This updates the user's private dashboard
    const holdingPath = `users/${userId}/holdings/${symbol}`;
    if (newUnits <= 0) {
        updates[holdingPath] = null;
    } else {
        updates[holdingPath] = {
            symbol: symbol,
            companyName: companyName, // Field key is 'companyName' in users node
            units: newUnits,
            wacc: Number(newWacc.toFixed(2)),
            lastUpdated: formattedDate
        };
    }

    // --- 3. ADD NEW TRANSACTION ---
    const newTxKey = push(ref(db, `users/${userId}/transactions`)).key;
    updates[`users/${userId}/transactions/${newTxKey}`] = {
        symbol: symbol,
        companyName: companyName,
        type: tx.type,
        units: txUnits,
        price: txPrice,
        timestamp: timestamp
    };

    // Apply the update atomically
    await update(ref(db), updates);

    return pruneTransactions(userId);
};

/**
 * Ensures the user's transaction history stays within limits
 */
const pruneTransactions = async (userId) => {
    const txRef = ref(db, `users/${userId}/transactions`);
    const snapshot = await get(txRef);

    if (!snapshot.exists()) return;

    const allTx = [];
    snapshot.forEach((child) => {
        allTx.push({ key: child.key, ...child.val() });
    });

    allTx.sort((a, b) => b.timestamp - a.timestamp);

    const cleanupUpdates = {};
    const companyCountMap = {};
    const keptTransactions = [];

    allTx.forEach((tx) => {
        const currentSymbol = tx.symbol;
        companyCountMap[currentSymbol] = (companyCountMap[currentSymbol] || 0) + 1;

        if (keptTransactions.length < 20 && companyCountMap[currentSymbol] <= 2) {
            keptTransactions.push(tx.key);
        } else {
            cleanupUpdates[`users/${userId}/transactions/${tx.key}`] = null;
        }
    });

    if (Object.keys(cleanupUpdates).length > 0) {
        return update(ref(db), cleanupUpdates);
    }
};