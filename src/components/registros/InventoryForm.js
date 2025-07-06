// components/InventoryForm.js
'use client';

import { useEffect } from 'react';

export default function InventoryForm({ register, errors, setValue, watch }) {
    // Observar los valores necesarios para el cálculo
    const previousInventory = watch('previousInventory') || 0;
    const dispatched = watch('dispatched') || 0;
    const exchange = watch('exchange') || 0;

    // Calcular el Total Inicial cuando cambien los valores
    useEffect(() => {
        const totalInicial = (
            parseFloat(previousInventory) +
            parseFloat(dispatched) +
            parseFloat(exchange)
        );
        setValue('initialTotal', isNaN(totalInicial) ? 0 : totalInicial);
    }, [previousInventory, dispatched, exchange, setValue]);

    return (
        <div className="section-container">
            <h3 className="section-title">Inventario y Despacho</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="previousInventory">Inventario Anterior:</label>
                    <input
                        type="number"
                        id="previousInventory"
                        className={`form-control ${errors.previousInventory ? 'is-invalid' : ''}`}
                        {...register('previousInventory', { valueAsNumber: true })}
                    />
                    {errors.previousInventory && (
                        <div className="invalid-feedback">{errors.previousInventory.message}</div>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="dispatched">Despacho:</label>
                    <input
                        type="number"
                        id="dispatched"
                        className={`form-control ${errors.dispatched ? 'is-invalid' : ''}`}
                        {...register('dispatched', { valueAsNumber: true })}
                        readOnly
                    />
                    {errors.dispatched && (
                        <div className="invalid-feedback">{errors.dispatched.message}</div>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="exchange">Cambio por cambio:</label>
                    <input
                        type="number"
                        id="exchange"
                        className={`form-control ${errors.exchange ? 'is-invalid' : ''}`}
                        {...register('exchange', { valueAsNumber: true })}
                        readOnly
                    />
                    {errors.exchange && (
                        <div className="invalid-feedback">{errors.exchange.message}</div>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="initialTotal">Total inicial:</label>
                    <input
                        type="number"
                        id="initialTotal"
                        className={`form-control ${errors.initialTotal ? 'is-invalid' : ''}`}
                        {...register('initialTotal', { valueAsNumber: true })}
                        readOnly
                    />
                    {errors.initialTotal && (
                        <div className="invalid-feedback">{errors.initialTotal.message}</div>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="finalInventory">Inventario final:</label>
                    <input
                        type="number"
                        id="finalInventory"
                        className={`form-control ${errors.finalInventory ? 'is-invalid' : ''}`}
                        {...register('finalInventory', { valueAsNumber: true })}
                    />
                    {errors.finalInventory && (
                        <div className="invalid-feedback">{errors.finalInventory.message}</div>
                    )}
                </div>
            </div>
        </div>
    );
}