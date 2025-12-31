import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

// Services
import {
  listenToPortfolio,
  updatePortfolioInDB,
  listenToMarketData // <--- Import the new listener
} from './services/portfolioService';

// UI Components
import Navbar from './components/UI/Navbar';
import Settings from './components/Auth/Settings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Verify from './components/Auth/Verify';

// Portfolio Components
import DashboardHeader from './components/Portfolio/DashboardHeader';
import TransactionForm from './components/Portfolio/TransactionForm';
import PortfolioTable from './components/Portfolio/PortfolioTable';
import SectorChart from './components/Portfolio/SectorChart';
import PortfolioChart from './components/Portfolio/PortfolioChart';
import MarketMovers from './components/Portfolio/MarketMovers';

import './App.css';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [holdings, setHoldings] = useState({});
  const [marketData, setMarketData] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [view, setView] = useState('dashboard');

  // 1. Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // 2. Combined Sync Effect (Safe Real-time Listeners)
  useEffect(() => {
    if (user?.emailVerified) {
      // Listener 1: Sync User Portfolio
      const unsubscribePortfolio = listenToPortfolio(user.uid, (data) => {
        setHoldings(data || {});
      });

      // Listener 2: Sync Global Market Data (SAFE FIX)
      // This replaces polling. Data is pushed only when it changes.
      const unsubscribeMarket = listenToMarketData((data) => {
        setMarketData(data || {});
      });

      // Cleanup: Stop listening when component unmounts or user changes
      return () => {
        unsubscribePortfolio && unsubscribePortfolio();
        unsubscribeMarket && unsubscribeMarket();
      };
    }
  }, [user]);

  // 3. Theme Toggle Effect
  useEffect(() => {
    const root = document.documentElement;
    const theme = isDarkMode ? 'dark' : 'light';
    root.classList.remove('dark-theme', 'light-theme');
    root.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  // 4. Transaction Logic
  const handleTransaction = async (tx) => {
    if (!user) return;
    try {
      await updatePortfolioInDB(user.uid, tx, holdings, marketData);
    } catch (error) {
      alert(error.message);
    }
  };

  if (authLoading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (window.location.pathname === '/verify') return <Verify />;

  if (!user || !user.emailVerified) {
    return isRegistering ?
      <Register toggleToLogin={() => setIsRegistering(false)} /> :
      <Login toggleToRegister={() => setIsRegistering(true)} />;
  }

  return (
    <div className="app-container">
      <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} setView={setView} currentView={view} />

      <main className="dashboard-content">
        {view === 'dashboard' ? (
          <>
            <DashboardHeader holdings={holdings} marketData={marketData} />

            <div className="layout-grid-system">
              <div className="input-analysis-row">
                <div className="form-wrapper">
                  <TransactionForm
                    onAddTransaction={handleTransaction}
                    marketData={marketData}
                    holdings={holdings}
                  />
                </div>
                <div className="chart-wrapper">
                  <PortfolioChart holdings={holdings} marketData={marketData} />
                </div>
              </div>

              <div className="full-row-item">
                <PortfolioTable holdings={holdings} marketData={marketData} />
              </div>

              <div className="full-row-item">
                <MarketMovers marketData={marketData} isDarkMode={isDarkMode} />
              </div>

              <div className="full-row-item">
                <SectorChart holdings={holdings} marketData={marketData} />
              </div>
            </div>
          </>
        ) : (
          <div className="settings-view-wrapper">
            <Settings />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 NEPSE Portfolio Manager • Real-time Data Connection</p>
      </footer>
    </div>
  );
}

export default App;