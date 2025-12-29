import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ isDarkMode, setIsDarkMode, setView, currentView }) => {
    const { user, logout } = useAuth();

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <h1 onClick={() => setView('dashboard')} style={{ cursor: 'pointer' }}>IPO Checker</h1>
            </div>

            <div className="nav-menu">
                <button
                    className={currentView === 'dashboard' ? 'active-nav' : ''}
                    onClick={() => setView('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button
                    className={currentView === 'settings' ? 'active-nav' : ''}
                    onClick={() => setView('settings')}
                >
                    ⚙️ Settings
                </button>
            </div>

            <div className="nav-actions">
                <button className="theme-btn" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button className="btn-logout" onClick={logout}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;