//src/app/registros/page.js
'use client';

import { useState } from 'react';
import RegistrosForm from '@/components/registros/RegistrosForm';

export default function RegistrosPage() {
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);

    return (
        <div className="registros-container">
            <RegistrosForm
                selectedClient={selectedClient}
                setSelectedClient={setSelectedClient}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                selectedArticle={selectedArticle}
                setSelectedArticle={setSelectedArticle}
            />
        </div>
    );
}