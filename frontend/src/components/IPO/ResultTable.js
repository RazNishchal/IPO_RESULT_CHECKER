import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';

const ResultTable = () => {
    const { user } = useAuth();
    const [boids, setBoids] = useState([]);

    useEffect(() => {
        if (!user) return;

        // 1. Create reference to the list
        const boidsRef = ref(db, 'userBOIDs');

        // 2. Listen for changes
        const unsubscribe = onValue(boidsRef, (snapshot) => {
            const data = snapshot.val();
            const list = [];

            for (let id in data) {
                // Only show BOIDs belonging to the logged-in user
                if (data[id].userId === user.uid) {
                    list.push({ id, ...data[id] });
                }
            }
            setBoids(list.reverse()); // Show newest first
        });

        return () => unsubscribe();
    }, [user]);

    const handleDelete = (id) => {
        if (window.confirm("Delete this member?")) {
            remove(ref(db, `userBOIDs/${id}`));
        }
    };

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>BOID</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {boids.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.boid}</td>
                            <td className={`status-${item.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                {item.status}
                            </td>
                            <td>
                                <button onClick={() => handleDelete(item.id)} className="btn-del">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResultTable;