import React, { useState, useEffect } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import '../css/settings.css';

const Settings = ({ isDarkMode }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', text: '' });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const user = auth.currentUser;

    // Auto-clear status messages
    useEffect(() => {
        if (status.text && !loading) {
            const timer = setTimeout(() => {
                setStatus({ type: '', text: '' });
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [status, loading]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setStatus({ type: '', text: '' });
        setLoading(true);

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            if (newPassword !== confirmPassword) {
                setLoading(false);
                return setStatus({ type: 'error', text: 'Mismatch!' });
            }

            if (newPassword.length < 8) {
                setLoading(false);
                return setStatus({ type: 'error', text: 'Min 8 chars' });
            }

            await updatePassword(user, newPassword);
            setStatus({ type: 'success', text: 'Updated Successfully!' });

            // Clear inputs on success
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setStatus({ type: 'error', text: 'Wrong Password' });
        } finally {
            setLoading(false);
        }
    };

    // UI for Google Users (Managed by Google)
    if (user?.providerData.some(p => p.providerId === 'google.com')) {
        return (
            <div className={`settings-page-container ${isDarkMode ? 'dark-mode' : ''}`}>
                <div className="settings-wrapper">
                    <div className="auth-header">
                        <h1>🔒 Security</h1>
                    </div>
                    <p style={{ textAlign: 'center', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '1rem' }}>
                        Account managed by Google.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`settings-page-container ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="settings-wrapper">
                <div className="auth-header">
                    <h1>🔒 Security</h1>
                </div>

                <form onSubmit={handleChangePassword} className="settings-form">
                    {/* Current Password */}
                    <div className="form-group">
                        <label className="stat-label">Current Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button type="button" className="toggle-view" onClick={() => setShowCurrent(!showCurrent)}>
                                {showCurrent ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="form-group">
                        <label className="stat-label">New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                required
                            />
                            <button type="button" className="toggle-view" onClick={() => setShowNew(!showNew)}>
                                {showNew ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label className="stat-label">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm New Password"
                                required
                            />
                            <button type="button" className="toggle-view" onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? "Updating Password..." : "Update Password"}
                    </button>
                </form>
            </div>

            {/* Status Feedback Pill */}
            <div className="status-container-outside">
                {status.text && (
                    <div className={`status-pill ${status.type}`}>
                        {status.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;