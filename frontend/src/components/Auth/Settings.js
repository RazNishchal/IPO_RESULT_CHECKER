import React, { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';

const Settings = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const user = auth.currentUser;

    // Check if user is a Google user
    const isGoogleUser = user?.providerData.some(
        (provider) => provider.providerId === 'google.com'
    );

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return alert("New passwords do not match!");
        }

        if (newPassword.length < 6) {
            return alert("New password must be at least 6 characters.");
        }

        setLoading(true);

        try {
            // 1. Create credential with the OLD password
            const credential = EmailAuthProvider.credential(user.email, currentPassword);

            // 2. Verify the user actually knows the old password (Re-auth)
            await reauthenticateWithCredential(user, credential);

            // 3. Update to the NEW password
            await updatePassword(user, newPassword);

            alert("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isGoogleUser) {
        return (
            <div className="main-card" style={{ marginTop: '20px', textAlign: 'center' }}>
                <h3>🔒 Security Settings</h3>
                <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>
                    You are logged in with <strong>Google</strong>. <br />
                    Please manage your password through your Google Account settings.
                </p>
            </div>
        );
    }

    return (
        <div className="main-card" style={{ marginTop: '20px' }}>
            <h3>🔒 Security Settings</h3>
            <form onSubmit={handleChangePassword} style={{ maxWidth: '400px', marginTop: '20px' }}>
                <div className="input-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Verifying & Updating..." : "Change Password"}
                </button>
            </form>
        </div>
    );
};

export default Settings;