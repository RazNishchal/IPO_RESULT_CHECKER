import React, { useState } from 'react';
import { db } from '../../firebase'; // Ensure your firebase.js initializes Realtime Database
import { ref, push, set } from 'firebase/database'; // These are for RTDB
import { useAuth } from '../../context/AuthContext';

const BOIDManager = () => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [boid, setBoid] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();

        // 1. Basic Validation
        if (boid.length !== 16) return alert("BOID must be exactly 16 digits.");
        if (!user) return alert("You must be logged in!");

        setLoading(true);

        try {
            // 2. Reference to the 'userBOIDs' path in Realtime Database
            const boidListRef = ref(db, 'userBOIDs');

            // 3. Generate a new unique ID (equivalent to addDoc)
            const newBoidRef = push(boidListRef);

            // 4. Save the data
            // This matches the .validate rules we just set up!
            await set(newBoidRef, {
                userId: user.uid,
                name: name,
                boid: boid,
                status: 'Not Checked',
                createdAt: Date.now() // RTDB prefers timestamps
            });

            // 5. Success cleanup
            setName('');
            setBoid('');
            alert("Member added successfully!");
        } catch (err) {
            console.error(err);
            alert("Error adding BOID: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="boid-manager">
            <h3>Add Family Member</h3>
            <form onSubmit={handleAdd} className="controls-grid">
                <input
                    type="text"
                    placeholder="Name (e.g., Mom)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="16-digit BOID"
                    value={boid}
                    onChange={(e) => setBoid(e.target.value)}
                    maxLength="16"
                    required
                />
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Member"}
                </button>
            </form>
        </section>
    );
};

export default BOIDManager;