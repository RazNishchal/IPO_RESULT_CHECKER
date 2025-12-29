import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

// Import Modular Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/UI/Navbar';
import BOIDManager from './components/IPO/BOIDManager';
import ResultTable from './components/IPO/ResultTable';
import CaptchaCheck from './components/IPO/CaptchaCheck';
import Settings from './components/Auth/Settings';

// Global Styles
import './App.css';

function App() {
  const { user, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // View state: 'dashboard' or 'settings'
  const [view, setView] = useState('dashboard');

  // Update body class when theme changes to ensure background color fills the screen
  useEffect(() => {
    const themeClass = isDarkMode ? 'dark-theme' : 'light-theme';
    document.body.className = themeClass;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Syncing with Realtime Database...</p>
    </div>
  );

  // 1. AUTHENTICATION LEVEL
  if (!user) {
    return (
      <div className="auth-wrapper">
        {isRegistering ? (
          <Register toggleToLogin={() => setIsRegistering(false)} />
        ) : (
          <Login toggleToRegister={() => setIsRegistering(true)} />
        )}
      </div>
    );
  }

  // 2. APP LEVEL (DASHBOARD / SETTINGS)
  return (
    <div className="app-container">
      {/* Navbar manages the View state and Theme toggle */}
      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setView={setView}
        currentView={view}
      />

      <main className="content-area">
        {view === 'dashboard' ? (
          <div className="dashboard-layout">
            <div className="management-section">
              <BOIDManager />
              <CaptchaCheck />
            </div>
            <div className="results-section">
              <ResultTable />
            </div>
          </div>
        ) : (
          <div className="settings-layout">
            <Settings />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 IPO Result Checker • Secure Realtime Sync</p>
      </footer>
    </div>
  );
}

export default App;