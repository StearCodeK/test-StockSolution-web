import { useState } from 'react';
import styles from '@/css/Movimientos.module.css';

export default function Filters({ options, onChange, onExport }) {
    const [filters, setFilters] = useState({
        userId: '',
        clientId: '',
        stateId: '',
        locationId: '',
        articleId: '',
        dateFrom: '',
        dateTo: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
    };

    const handleApply = () => {
        onChange(filters);
    };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.formGroup}>
                <label htmlFor="filterUser">Usuario</label>
                <select
                    id="filterUser"
                    name="userId"
                    className={styles.formControl}
                    value={filters.userId}
                    onChange={handleChange}
                >
                    <option value="">Todos</option>
                    {options.users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.nombre} {user.apellido}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="filterClient">Cliente</label>
                <select
                    id="filterClient"
                    name="clientId"
                    className={styles.formControl}
                    value={filters.clientId}
                    onChange={handleChange}
                >
                    <option value="">Todos</option>
                    {options.clients.map(client => (
                        <option key={client.id_cliente_maestro} value={client.id_cliente_maestro}>
                            {client.nombre_cliente}
                        </option>
                    ))}
                </select>
            </div>

            {/* Resto de los filtros similares */}

            <div className={styles.formActions}>
                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handleApply}
                >
                    <i className="fas fa-filter"></i> Aplicar
                </button>

                <button
                    className={`${styles.btn} ${styles.btnSuccess}`}
                    onClick={onExport}
                >
                    <i className="fas fa-file-excel"></i> Exportar
                </button>
            </div>
        </div>
    );
}