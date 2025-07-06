// components/CalculationsForm.js
'use client';

import { useEffect } from 'react';

export default function CalculationsForm({ register, errors, setValue, watch }) {
    // Observar los valores necesarios para los cálculos
    const initialTotal = watch('initialTotal') || 0;
    const finalInventory = watch('finalInventory') || 0;
    const expirationReturns = watch('expirationReturns') || 0;
    const qualityReturns = watch('qualityReturns') || 0;

    // Calcular venta y sugerido cuando cambien los valores
    useEffect(() => {
        const venta = parseFloat(initialTotal) - parseFloat(finalInventory) -
            parseFloat(expirationReturns) - parseFloat(qualityReturns);
        const sugerido = parseFloat(initialTotal) - parseFloat(finalInventory) -
            parseFloat(expirationReturns);

        setValue('sales', isNaN(venta) ? 0 : venta);
        setValue('suggested', isNaN(sugerido) ? 0 : sugerido);
    }, [initialTotal, finalInventory, expirationReturns, qualityReturns, setValue]);

    return (
        <div className="section-container">
            <h3 className="section-title">Cálculos</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="sales">Venta:</label>
                    <input
                        type="number"
                        id="sales"
                        className={`form-control ${errors.sales ? 'is-invalid' : ''}`}
                        {...register('sales', { valueAsNumber: true })}
                        readOnly
                    />
                    {errors.sales && (
                        <div className="invalid-feedback">{errors.sales.message}</div>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="suggested">Sugerido:</label>
                    <input
                        type="number"
                        id="suggested"
                        className={`form-control ${errors.suggested ? 'is-invalid' : ''}`}
                        {...register('suggested', { valueAsNumber: true })}
                        readOnly
                    />
                    {errors.suggested && (
                        <div className="invalid-feedback">{errors.suggested.message}</div>
                    )}
                </div>
            </div>
        </div>
    );
}