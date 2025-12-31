import React, { useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    signOut
} from 'firebase/auth';
import { auth, APP_URL } from '../../firebase';
import '../css/auth.css'; // Path: Auth -> components -> src -> css -> auth.css

const Login = ({ toggleToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Auto-clear status messages
    useEffect(() => {
        if (status.text) {
            const timer = setTimeout(() => setStatus({ type: '', text: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            if (!userCred.user.emailVerified) {
                setStatus({ type: 'error', text: 'Please verify your email first!' });
                await signOut(auth);
            }
        } catch (err) {
            setStatus({ type: 'error', text: 'Invalid email or password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email || !password) {
            return setStatus({ type: 'error', text: 'Enter credentials to resend link.' });
        }
        setLoading(true);
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const actionCodeSettings = {
                url: `${APP_URL}/verify`,
                handleCodeInApp: true
            };
            await sendEmailVerification(userCred.user, actionCodeSettings);
            await signOut(auth);
            setStatus({ type: 'success', text: 'A fresh link has been sent to your Gmail!' });
        } catch (err) {
            setStatus({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) return setStatus({ type: 'error', text: 'Please enter your email first.' });

        setLoading(true);
        const actionCodeSettings = {
            url: APP_URL,
            handleCodeInApp: true
        };

        try {
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            setStatus({ type: 'success', text: 'Reset link sent! Check your Gmail.' });
        } catch (err) {
            setStatus({ type: 'error', text: 'Account not found.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="form-slide-in">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Enter your details to manage your IPOs</p>
                </div>

                {/* Status message placed between header and form */}
                {status.text && (
                    <div className={`status-msg ${status.type}`}>
                        {status.text}
                    </div>
                )}

                <form onSubmit={handleLogin} className="auth-form-body">
                    <div className="input-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="forgot-link-container">
                        <span onClick={handleForgotPassword} className="link-btn-small">Forgot Password?</span>
                        <span onClick={handleResendVerification} className="link-btn-small" style={{ color: '#64748b' }}>Resend Link?</span>
                    </div>

                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account?
                        <button onClick={toggleToRegister} className="link-btn">Register</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;