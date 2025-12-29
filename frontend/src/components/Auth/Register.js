import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';

const Register = ({ toggleToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        // 1. Validation: Check if passwords match
        if (password !== confirmPassword) {
            return alert("Passwords do not match!");
        }

        // 2. Validation: Strength check (Optional but recommended)
        if (password.length < 6) {
            return alert("Password should be at least 6 characters.");
        }

        setLoading(true);
        try {
            // 3. Create User
            const userCred = await createUserWithEmailAndPassword(auth, email, password);

            // 4. Send Verification Email (Acts as your OTP link)
            await sendEmailVerification(userCred.user);

            alert("Registration successful! A verification link has been sent to " + email + ". Please verify your email before logging in.");

            // 5. Redirect to Login
            toggleToLogin();
        } catch (err) {
            // Handle common Firebase errors
            if (err.code === 'auth/email-already-in-use') {
                alert("This email is already registered. Please login instead.");
            } else {
                alert(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-card">
            <h2>Create Account</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Step 1: Sign up with your details<br />
                Step 2: Verify the link sent to your mail
            </p>

            <form onSubmit={handleRegister}>
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Create Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Sending Verification..." : "Register & Send OTP Link"}
                </button>
            </form>

            <p onClick={toggleToLogin} className="toggle-text">
                Already have an account? <strong>Login</strong>
            </p>
        </div>
    );
};

export default Register;