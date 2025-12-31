import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, APP_URL } from '../../firebase';
import '../css/auth.css'; // Path: Auth -> components -> src -> css -> auth.css

const Register = ({ toggleToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', text: '' });

    useEffect(() => {
        if (status.text) {
            const timer = setTimeout(() => setStatus({ type: '', text: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (password !== confirmPassword) {
            return setStatus({ type: 'error', text: 'Passwords do not match!' });
        }

        setLoading(true);
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);

            const actionCodeSettings = {
                url: `${APP_URL}/verify`,
                handleCodeInApp: true,
            };

            await sendEmailVerification(userCred.user, actionCodeSettings);
            await signOut(auth);

            setStatus({
                type: 'success',
                text: 'Success! Please check your Gmail to verify your account.'
            });

            setTimeout(() => toggleToLogin(), 3000);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setStatus({ type: 'error', text: 'Email already exists. Try logging in.' });
            } else {
                setStatus({ type: 'error', text: 'Failed to create account. Try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="form-slide-in register-form">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join us to manage your IPO applications efficiently.</p>
                </div>

                {status.text && (
                    <div className={`status-msg ${status.type}`}>
                        {status.text}
                    </div>
                )}

                <form onSubmit={handleRegister} className="auth-form-body">
                    <div className="input-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="yourname@gmail.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? "Processing..." : "Register & Send Link"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account?
                        <button onClick={toggleToLogin} className="link-btn">Login</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;