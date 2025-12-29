import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';

const Login = ({ toggleToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);

            // Check if "OTP" (Verification Link) was clicked
            // Google users are automatically verified by Firebase
            if (!userCred.user.emailVerified) {
                alert("Please verify your email first! Check your inbox for the verification link.");
                await auth.signOut();
                return;
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) return alert("Please type your email address in the box above first.");
        try {
            await sendPasswordResetEmail(auth, email);
            alert("A password reset link (OTP) has been sent to your email!");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="login-card">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
                <button type="submit" className="btn-primary">Sign In</button>
            </form>

            <p onClick={handleForgotPassword} className="toggle-text" style={{ color: '#e74c3c', marginTop: '10px' }}>
                Forgot Password?
            </p>

            <div className="separator"><span>OR</span></div>

            <button className="google-btn" onClick={() => signInWithPopup(auth, googleProvider)}>
                Continue with Google
            </button>

            <p onClick={toggleToRegister} className="toggle-text">
                Don't have an account? <strong>Register</strong>
            </p>
        </div>
    );
};

export default Login;