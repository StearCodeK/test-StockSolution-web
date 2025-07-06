import { useState, useEffect } from 'react';
import Select from 'react-select';
import { loadEstados } from '../../lib/registros-api';

export default function StateSelect({
    selectedClient,
    selectedState,
    setSelectedState,
    setSelectedLocation,
    setSelectedArticle
}) {
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedClient) {
            const fetchEstados = async () => {
                setLoading(true);
                try {
                    const data = await loadEstados(selectedClient);
                    setEstados(data);
                } catch (error) {
                    console.error('Error cargando estados:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchEstados();
        } else {
            setEstados([]);
        }
    }, [selectedClient]);

    const options = estados.map(estado => ({
        value: estado.id,
        label: estado.nombre
    }));

    const handleChange = (selectedOption) => {
        setSelectedState(selectedOption ? selectedOption.value : '');
        setSelectedLocation(null);
        setSelectedArticle(null);
    };

    return (
        <div className="form-group">
            <label htmlFor="stateSelect">Estado:</label>
            <Select
                id="stateSelect"
                options={options}
                value={options.find(opt => opt.value === selectedState) || null}
                onChange={handleChange}
                isClearable
                isLoading={loading}
                placeholder="Seleccione o busque un estado..."
                noOptionsMessage={() => loading ? 'Cargando estados...' : 'Sin resultados'}
                isDisabled={!selectedClient || loading} // <-- aquí se bloquea si no hay cliente
            />
        </div>
    );
}