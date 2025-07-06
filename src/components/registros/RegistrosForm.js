'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registroSchema } from '@/lib/validationSchemas';
import ClientSelect from './ClientSelect';
import StateSelect from './StateSelect';
import LocationSelect from './LocationSelect';
import ArticleSelect from './ArticleSelect';
import InventoryForm from './InventoryForm';
import ReturnsForm from './ReturnsForm';
import CalculationsForm from './CalculationsForm';
import OrdersForm from './OrdersForm';
import { saveRegistro } from '@/lib/registros-api';

export default function RegistrosForm({
    selectedClient,
    setSelectedClient,
    selectedState,
    setSelectedState,
    selectedLocation,
    setSelectedLocation,
    selectedArticle,
    setSelectedArticle
}) {
    const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
        resolver: zodResolver(registroSchema),
        defaultValues: {
            inventoryDate: '',
            nextDispatch: '',
            previousInventory: '',
            dispatched: '',
            exchange: '',
            initialTotal: '',
            finalInventory: '',
            expirationReturns: '',
            qualityReturns: '',
            sales: '',
            suggested: '',
            price: '',
            quantity: '',
            orderTotal: ''
        }
    });
    const [lastDispatch, setLastDispatch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await saveRegistro({
                selectedClient,
                selectedLocation,
                selectedArticle,
                formData: data
            });
            reset();
            setLastDispatch('');
            alert('Registro guardado exitosamente');
        } catch (error) {
            console.error('Error al guardar el registro:', error);
            alert(`Error al guardar: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValue(name, value);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="registros-form">
            {/* Sección de selección */}
            <div className="section-container">
                <h3 className="section-title">Cliente y Artículo</h3>
                <div className="form-grid">
                    <ClientSelect
                        selectedClient={selectedClient}
                        setSelectedClient={setSelectedClient}
                        setSelectedState={setSelectedState}
                        setSelectedLocation={setSelectedLocation}
                        setSelectedArticle={setSelectedArticle}
                    />

                    <StateSelect
                        selectedClient={selectedClient}
                        selectedState={selectedState}
                        setSelectedState={setSelectedState}
                        setSelectedLocation={setSelectedLocation}
                        setSelectedArticle={setSelectedArticle}
                    />

                    <LocationSelect
                        selectedClient={selectedClient}
                        selectedState={selectedState}
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                        setSelectedArticle={setSelectedArticle}
                    />

                    <ArticleSelect
                        selectedClient={selectedClient}
                        selectedLocation={selectedLocation}
                        selectedArticle={selectedArticle}
                        setSelectedArticle={setSelectedArticle}
                        setLastDispatch={setLastDispatch}
                        setFormData={setValue} // Cambiado para usar setValue de react-hook-form
                    />
                </div>
            </div>

            {/* Sección de fechas */}
            <div className="section-container">
                <h3 className="section-title">Fechas Claves</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="lastDispatch">Último despacho:</label>
                        <input
                            type="text"
                            id="lastDispatch"
                            className="form-control"
                            value={lastDispatch}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="inventoryDate">Fecha Inventario:</label>
                        <input
                            type="date"
                            id="inventoryDate"
                            className={`form-control ${errors.inventoryDate ? 'is-invalid' : ''}`}
                            {...register('inventoryDate')}
                            onChange={handleInputChange}
                        />
                        {errors.inventoryDate && (
                            <div className="invalid-feedback">{errors.inventoryDate.message}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="nextDispatch">Próximo despacho:</label>
                        <input
                            type="date"
                            id="nextDispatch"
                            className={`form-control ${errors.nextDispatch ? 'is-invalid' : ''}`}
                            {...register('nextDispatch')}
                            onChange={handleInputChange}
                        />
                        {errors.nextDispatch && (
                            <div className="invalid-feedback">{errors.nextDispatch.message}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sección de inventario */}
            <InventoryForm
                register={register}
                errors={errors}
                setValue={setValue} // Asegúrate de incluir esta línea
                watch={watch}       // También necesitas pasar watch
            />



            <ReturnsForm
                register={register}
                errors={errors}
                handleInputChange={handleInputChange}
            />

            {/* Sección de cálculos */}
            <CalculationsForm
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
            />

            {/* Nueva sección de pedidos */}
            <OrdersForm
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
            />

            {/* Botones */}
            <div className="form-actions">
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                        reset();
                        setLastDispatch('');
                    }}
                >
                    Limpiar
                </button>
                <p className="form-warning">
                    Los registros guardados no podrán ser modificados. Asegúrese de que no haya ningún error.
                </p>
            </div>
        </form>
    );
}