import React from 'react';
import './css/MarketMovers.css';

const MarketMovers = ({ marketData = {}, isDarkMode }) => {

    // Clean ticker utility (Returns only the symbol like 'NABIL')
    const getCleanTicker = (str) => {
        if (!str) return "";
        return str.toString()
            .split(/[\s-]+/)[0]
            .replace(/[^a-zA-Z0-9]/g, '')
            .toUpperCase();
    };

    const allStocks = Object.values(marketData);

    const processedStocks = allStocks.map(stock => {
        const ltp = parseFloat(stock.ltp || 0);
        const rawPtChange = parseFloat(stock.pointChange || 0);
        const rawPerChange = parseFloat(stock.percentChange || 0);

        // ⚡ MATH FIX: Correcting the 100x inflation from the scraper
        const correctedPercent = rawPerChange / 100;

        return {
            ...stock,
            displaySymbol: getCleanTicker(stock.symbol),
            calculatedLtp: ltp,
            displayPoint: rawPtChange,
            displayPercent: correctedPercent
        };
    }).filter(stock => stock.displaySymbol && stock.calculatedLtp > 0);

    // Sort for top 5 gainers
    const gainers = [...processedStocks]
        .sort((a, b) => b.displayPercent - a.displayPercent)
        .slice(0, 5);

    // Sort for top 5 losers
    const losers = [...processedStocks]
        .sort((a, b) => a.displayPercent - b.displayPercent)
        .slice(0, 5);

    const MoverList = ({ title, stocks, type }) => (
        <div className={`mover-column ${type} ${isDarkMode ? 'dark' : 'light'}`}>
            <h3 className="mover-title">{title}</h3>
            <div className="mover-grid">
                <div className="mover-header">
                    <span>Symbol</span>
                    <span>LTP</span>
                    <span className="text-right">Change</span>
                </div>
                {stocks.map((stock, index) => {
                    const ptChange = stock.displayPoint;
                    const perChange = stock.displayPercent;

                    const ptPrefix = ptChange > 0 ? '+' : '';
                    const percentPrefix = perChange > 0 ? '+' : '';
                    const statusClass = perChange >= 0 ? 'text-green' : 'text-red';

                    return (
                        <div key={`${stock.displaySymbol}-${index}`} className="mover-row">
                            {/* ⚡ STRICTLY SYMBOL ONLY */}
                            <span className="symbol-text">{stock.displaySymbol}</span>

                            <span className="ltp-value">
                                {stock.calculatedLtp.toLocaleString()}
                            </span>

                            <span className={`text-right mover-stat ${statusClass}`}>
                                <div className="stat-point">
                                    {ptPrefix}{ptChange.toFixed(2)}
                                </div>
                                <div className="stat-perc">
                                    {percentPrefix}{perChange.toFixed(2)}%
                                </div>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className={`market-movers-container ${isDarkMode ? 'dark-mode' : ''}`}>
            <MoverList title="🚀 Top Gainers" stocks={gainers} type="gainers" />
            <MoverList title="📉 Top Losers" stocks={losers} type="losers" />
        </div>
    );
};

export default MarketMovers;