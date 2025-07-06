// components/OrdersForm.js

'use client';

import { useEffect } from 'react';


export default function OrdersForm({ register, errors, setValue, watch }) {
    // Observar los cambios en precio y cantidad para calcular el total
    const price = watch('price') || 0;
    const quantity = watch('quantity') || 0;

    // Calcular el total cuando cambien precio o cantidad
    useEffect(() => {
        const total = parseFloat(price) * parseFloat(quantity);
        setValue('orderTotal', isNaN(total) ? 0 : total);
    }, [price, quantity, setValue]);

    return (
        <div className="section-container">
            <h3 className="section-title">Pedidos</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="price">Precio:</label>
                    <input
                        type="number"
                        id="price"
                        step="0.01"
                        min="0"
                        className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                        {...register('price', {
                            valueAsNumber: true,
                            min: { value: 0, message: "El precio no puede ser negativo" }
                        })}
                        readOnly
                    />
                    {errors.price && (
                        <div className="invalid-feedback">{errors.price.message}</div>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="quantity">Cantidad Pedida:</label>
                    <input
                        type="number"
                        id="quantity"
                        min="0"
                        className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                        {...register('quantity', {
                            valueAsNumber: true,
                            min: { value: 0, message: "La cantidad no puede ser negativa" }
                        })}
                    />
                    {errors.quantity && (
                        <div className="invalid-feedback">{errors.quantity.message}</div>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="orderTotal">Total:</label>
                    <input
                        type="number"
                        id="orderTotal"
                        className={`form-control ${errors.orderTotal ? 'is-invalid' : ''}`}
                        {...register('orderTotal', { valueAsNumber: true })}
                        readOnly
                    />
                    {errors.orderTotal && (
                        <div className="invalid-feedback">{errors.orderTotal.message}</div>
                    )}
                </div>
            </div>
        </div>
    );
}