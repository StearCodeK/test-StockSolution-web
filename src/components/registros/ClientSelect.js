import { useState, useEffect } from 'react';
import Select from 'react-select';
import { loadClientes } from '../../lib/registros-api';

export default function ClientSelect({
    selectedClient,
    setSelectedClient,
    setSelectedState,
    setSelectedLocation,
    setSelectedArticle
}) {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClientes = async () => {
            setLoading(true);
            try {
                const data = await loadClientes();
                setClientes(data);
            } catch (error) {
                console.error('Error cargando clientes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchClientes();
    }, []);

    const options = clientes.map(cliente => ({
        value: cliente.id_cliente_maestro,
        label: cliente.nombre_cliente
    }));

    const handleChange = (selectedOption) => {
        setSelectedClient(selectedOption ? selectedOption.value : '');
        setSelectedState(null);
        setSelectedLocation(null);
        setSelectedArticle(null);
    };

    return (
        <div className="form-group">
            <label htmlFor="clientSelect">Cliente:</label>
            <Select
                id="clientSelect"
                options={options}
                value={options.find(opt => opt.value === selectedClient) || null}
                onChange={handleChange}
                isClearable
                isLoading={loading}
                placeholder="Seleccione o busque un cliente..."
                noOptionsMessage={() => loading ? 'Cargando clientes...' : 'Sin resultados'}
            />
        </div>
    );
}