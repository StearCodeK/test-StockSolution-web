// components/ReturnsForm.js
'use client';

export default function ReturnsForm({ register, errors, handleInputChange }) {
    return (
        <div className="section-container">
            <h3 className="section-title">Devoluciones</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="expirationReturns">Por vencimientos:</label>
                    <input
                        type="number"
                        id="expirationReturns"
                        min="0"
                        className={`form-control ${errors.expirationReturns ? 'is-invalid' : ''}`}
                        {...register('expirationReturns', {
                            valueAsNumber: true,
                            min: { value: 0, message: "El valor no puede ser negativo" }
                        })}
                        onChange={handleInputChange}
                    />
                    {errors.expirationReturns && (
                        <div className="invalid-feedback">{errors.expirationReturns.message}</div>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="qualityReturns">Por calidad:</label>
                    <input
                        type="number"
                        id="qualityReturns"
                        min="0"
                        className={`form-control ${errors.qualityReturns ? 'is-invalid' : ''}`}
                        {...register('qualityReturns', {
                            valueAsNumber: true,
                            min: { value: 0, message: "El valor no puede ser negativo" }
                        })}
                        onChange={handleInputChange}
                    />
                    {errors.qualityReturns && (
                        <div className="invalid-feedback">{errors.qualityReturns.message}</div>
                    )}
                </div>
            </div>
        </div>
    );
}