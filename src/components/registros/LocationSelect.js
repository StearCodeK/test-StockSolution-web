'use client';

import { useState, useEffect } from 'react';
import Select from 'react-select';
import { loadUbicaciones } from '../../lib/registros-api';

export default function LocationSelect({
    selectedClient,
    selectedState,
    selectedLocation,
    setSelectedLocation,
    setSelectedArticle
}) {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedState) {
            const fetchUbicaciones = async () => {
                setLoading(true);
                try {
                    const data = await loadUbicaciones(selectedState, selectedClient);
                    setUbicaciones(data);
                } catch (error) {
                    console.error('Error cargando ubicaciones:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUbicaciones();
        } else {
            setUbicaciones([]);
        }
    }, [selectedState, selectedClient]);

    const options = ubicaciones.map(ubicacion => ({
        value: ubicacion.id_ubicacion,
        label: ubicacion.nombre_ubicacion
    }));

    const handleChange = (selectedOption) => {
        setSelectedLocation(selectedOption ? selectedOption.value : '');
        setSelectedArticle(null);
    };

    return (
        <div className="form-group">
            <label htmlFor="locationSelect">Ubicación:</label>
            <Select
                id="locationSelect"
                options={options}
                value={options.find(opt => opt.value === selectedLocation) || null}
                onChange={handleChange}
                isClearable
                isLoading={loading}
                placeholder="Seleccione o busque una ubicación..."
                noOptionsMessage={() => loading ? 'Cargando ubicaciones...' : 'Sin resultados'}
                isDisabled={!selectedState || loading}
            />
        </div>
    );
}