import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './css/navbar.css';

const Navbar = ({ isDarkMode, setIsDarkMode, setView, currentView }) => {
    const { logout } = useAuth();

    // Handler to safely toggle theme
    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* 1. BRAND (LEFT on Desktop, TOP-LEFT on Mobile) */}
                <div className="nav-brand" onClick={() => setView('dashboard')}>
                    <h1>💰 Manager</h1>
                </div>

                {/* 2. MENU (CENTER on Desktop, BOTTOM-ROW on Mobile) */}
                <div className="nav-menu">
                    <button
                        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setView('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                        onClick={() => setView('settings')}
                    >
                        Settings
                    </button>
                </div>

                {/* 3. ACTIONS (RIGHT on Desktop, TOP-RIGHT on Mobile) */}
                <div className="nav-right">
                    {/* Theme Toggle Button */}
                    <button
                        className="theme-toggle"
                        onClick={handleThemeToggle}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label="Toggle Theme"
                    >
                        <span className="toggle-icon">
                            {isDarkMode ? '☀️' : '🌙'}
                        </span>
                    </button>

                    <button className="btn-logout-minimal" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;