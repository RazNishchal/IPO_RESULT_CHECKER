import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, get, update } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';

const CaptchaCheck = () => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [selectedIPO, setSelectedIPO] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [queue, setQueue] = useState([]);
    const [captchaImg, setCaptchaImg] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');

    // Fetch IPO list on load
    useEffect(() => {
        fetch('/api/companies')
            .then(res => res.json())
            .then(data => setCompanies(data.body || []))
            .catch(err => console.error("Error fetching companies:", err));
    }, []);

    const startChecking = async () => {
        if (!selectedIPO) return alert("Select an IPO first!");

        const snapshot = await get(ref(db, 'userBOIDs'));
        const data = snapshot.val();
        const userBoids = [];

        for (let id in data) {
            if (data[id].userId === user.uid) {
                userBoids.push({ id, ...data[id] });
            }
        }

        if (userBoids.length === 0) return alert("No BOIDs found in your list.");

        setQueue(userBoids);
        setIsChecking(true);
        setCurrentIndex(0);
        loadNextCaptcha(userBoids[0].id); // Pass the unique DB ID
    };

    const loadNextCaptcha = (sessionId) => {
        setCaptchaImg(''); // Clear old captcha
        fetch(`/api/captcha/${sessionId}`)
            .then(res => res.json())
            .then(data => setCaptchaImg(data.image));
    };

    const handleVerify = async () => {
        if (!captchaInput) return;
        const currentItem = queue[currentIndex];

        try {
            const res = await fetch('/api/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: currentItem.id, // Session ID for backend cookie tracking
                    boid: currentItem.boid,
                    companyId: selectedIPO,
                    captcha: captchaInput
                })
            });

            const data = await res.json();

            // Update Realtime Database with result
            await update(ref(db, `userBOIDs/${currentItem.id}`), {
                status: data.message // e.g., "Congratulations..." or "Sorry..."
            });

            setCaptchaInput('');

            if (currentIndex < queue.length - 1) {
                const next = currentIndex + 1;
                setCurrentIndex(next);
                loadNextCaptcha(queue[next].id);
            } else {
                setIsChecking(false);
                alert("All members checked!");
            }
        } catch (err) {
            alert("Verification failed. Please try again.");
            loadNextCaptcha(currentItem.id); // Reload captcha on error
        }
    };

    return (
        <div className="main-card" style={{ marginTop: '20px' }}>
            {!isChecking ? (
                <div className="controls-grid">
                    <select value={selectedIPO} onChange={(e) => setSelectedIPO(e.target.value)}>
                        <option value="">-- Select IPO Company --</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={startChecking} className="btn-primary">Start Mass Check</button>
                </div>
            ) : (
                <div className="captcha-section">
                    <h4>Checking for: {queue[currentIndex].name}</h4>
                    <div className="captcha-box">
                        {captchaImg ? <img src={captchaImg} alt="captcha" /> : <p>Loading Captcha...</p>}
                    </div>
                    <input
                        type="text"
                        placeholder="Enter Captcha"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                        autoFocus
                    />
                    <button onClick={handleVerify} className="btn-primary">Verify & Next</button>
                </div>
            )}
        </div>
    );
};

export default CaptchaCheck;