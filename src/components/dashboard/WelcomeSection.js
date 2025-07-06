'use client';

import { useState, useEffect } from 'react';

export default function WelcomeSection({ user }) {
    const [currentDateTime, setCurrentDateTime] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            setCurrentDateTime(new Date().toLocaleString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }));
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="welcome-section ">
            <h2>Bienvenido, <span id="welcomeName">{user?.nombre || user?.email}</span></h2>
            <p id="currentDateTime">{currentDateTime}</p>
        </section>
    );
}