import styles from '@/css/Movimientos.module.css';

export default function MovimientosTable({ data, loading }) {
    const headers = [
        'ID', 'Usuario', 'Fecha/Hora', 'Cliente', 'Estado', 'Ubicación',
        'Artículo', 'Inv. Ant.', 'Despacho', 'Cambio', 'Total',
        'Inv. Final', 'Dev. Venc.', 'Dev. Cal.', 'Venta', 'Sugerido'
    ];

    if (loading) {
        return (
            <div className={styles.tableContainer}>
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            {headers.map(header => (
                                <th key={header}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={headers.length} className={styles.loading}>
                                Cargando datos...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.tableContainer}>
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            {headers.map(header => (
                                <th key={header}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={headers.length} className={styles.noData}>
                                No se encontraron registros
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.adminTable}>
                <thead>
                    <tr>
                        {headers.map(header => (
                            <th key={header}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.id_registro || index}>
                            <td>{index + 1}</td>
                            <td>{item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido}` : 'N/A'}</td>
                            <td>{new Date(item.fecha_registro).toLocaleString()}</td>
                            <td>{item.sucursal?.cliente || 'N/A'}</td>
                            <td>{item.sucursal?.estado || 'N/A'}</td>
                            <td>{item.sucursal?.ubicacion || 'N/A'}</td>
                            <td>{item.articulo || 'N/A'}</td>
                            <td>{item.inventario_anterior || 0}</td>
                            <td>{item.despacho || 0}</td>
                            <td>{item.cambio_por_cambio || 0}</td>
                            <td>{item.total_inicial || 0}</td>
                            <td>{item.inventario_final || 0}</td>
                            <td>{item.devolucion_vencimiento || 0}</td>
                            <td>{item.devolucion_calidad || 0}</td>
                            <td>{item.venta || 0}</td>
                            <td>{item.sugerido || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}