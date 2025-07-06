// src/app//components/historial/ExportButton.js
"use client";

import { useState } from 'react';

export default function ExportButton({ data, isExporting, setIsExporting }) {
    const [error, setError] = useState(null);

    const exportToExcel = async () => {
        setIsExporting(true);
        setError(null);

        try {
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Movimientos');

            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Usuario', key: 'usuario', width: 20 },
                { header: 'Fecha/Hora', key: 'fecha', width: 20 },
                { header: 'Cliente', key: 'cliente', width: 20 },
                { header: 'Estado', key: 'estado', width: 15 },
                { header: 'Ubicación', key: 'ubicacion', width: 15 },
                { header: 'Artículo', key: 'articulo', width: 20 },
                { header: 'Inv. Anterior', key: 'invAnterior', width: 12 },
                { header: 'Despacho', key: 'despacho', width: 12 },
                { header: 'Cambio', key: 'cambio', width: 12 },
                { header: 'Total', key: 'total', width: 12 },
                { header: 'Inv. Final', key: 'invFinal', width: 12 },
                { header: 'Dev. Venc.', key: 'devVenc', width: 12 },
                { header: 'Dev. Cal.', key: 'devCal', width: 12 },
                { header: 'Venta', key: 'venta', width: 12 },
                { header: 'Sugerido', key: 'sugerido', width: 12 },
                { header: 'Precio', key: 'precio', width: 12 },
                { header: 'Pedido', key: 'pedido', width: 12 },
                { header: 'Total Pedido', key: 'totalPedido', width: 12 }
            ];

            data.forEach((item, index) => {
                worksheet.addRow({
                    id: index + 1,
                    usuario: item.usuario || 'N/A',
                    fecha: new Date(item.fecha_registro).toLocaleString(),
                    cliente: item.sucursal?.cliente || 'N/A',
                    estado: item.sucursal?.estado || 'N/A',
                    ubicacion: item.sucursal?.ubicacion || 'N/A',
                    articulo: item.articulo || 'N/A',
                    invAnterior: item.inventario_anterior || 0,
                    despacho: item.despacho || 0,
                    cambio: item.cambio_por_cambio || 0,
                    total: item.total_inicial || 0,
                    invFinal: item.inventario_final || 0,
                    devVenc: item.devolucion_vencimiento || 0,
                    devCal: item.devolucion_calidad || 0,
                    venta: item.venta || 0,
                    sugerido: item.sugerido || 0,
                    precio: item.precio_pedido || 0,
                    pedido: item.cantidad_pedida || 0,
                    totalPedido: item.total_pedido || 0
                });
            });

            worksheet.getRow(1).eachCell(cell => {
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD3D3D3' }
                };
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `Movimientos_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);

        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            setError('Error al exportar a Excel. Por favor, inténtelo de nuevo.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="export-container">
            <button
                onClick={exportToExcel}
                className="btn btn-success-export"
                disabled={isExporting}
            >
                {isExporting ? (
                    <><i className="fas fa-spinner fa-spin"></i> Exportando...</>
                ) : (
                    <><i className="fas fa-file-excel"></i> Exportar</>
                )}
            </button>
            {error && <div className="export-error">{error}</div>}
        </div>
    );
}