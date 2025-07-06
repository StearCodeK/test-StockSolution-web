"use client";

export default function HistorialTable({ data, isLoading }) {
    return (
        <div className="table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Fecha/Hora</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                        <th>Ubicación</th>
                        <th>Artículo</th>
                        <th>Inv. Ant.</th>
                        <th>Despacho</th>
                        <th>Cambio</th>
                        <th>Total</th>
                        <th>Inv. Final</th>
                        <th>Dev. Venc.</th>
                        <th>Dev. Cal.</th>
                        <th>Venta</th>
                        <th>Sugerido</th>
                        <th>Precio</th>
                        <th>Pedido</th>
                        <th>Total Pedido</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={17} className="loading-data">
                                Cargando datos...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={17} className="no-data">
                                No se encontraron registros
                            </td>
                        </tr>
                    ) : (
                        data.map(item => (
                            <tr key={item.id_registro}>
                                <td>{new Date(item.fecha_registro).toLocaleString()}</td>
                                <td>{item.sucursal?.cliente || 'N/A'}</td>
                                <td>{item.sucursal?.estado || 'N/A'}</td>
                                <td>{item.sucursal?.ubicacion || 'N/A'}</td>
                                <td>{item.articulo || 'N/A'}</td>
                                <td>{item.inventario_anterior || '0'}</td>
                                <td>{item.despacho || '0'}</td>
                                <td>{item.cambio_por_cambio || '0'}</td>
                                <td>{item.total_inicial || '0'}</td>
                                <td>{item.inventario_final || '0'}</td>
                                <td>{item.devolucion_vencimiento || '0'}</td>
                                <td>{item.devolucion_calidad || '0'}</td>
                                <td>{item.venta || '0'}</td>
                                <td>{item.sugerido || '0'}</td>
                                <td>{item.precio_pedido || '0.00'}</td>
                                <td>{item.cantidad_pedida || '0'}</td>
                                <td>{item.total_pedido || '0.00'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}