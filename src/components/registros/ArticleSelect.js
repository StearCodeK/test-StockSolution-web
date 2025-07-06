'use client';

import { useState, useEffect } from 'react';
import Select from 'react-select';
import {
    loadArticulos,
    loadUltimoDespacho,
    loadPreviousInventory,
    loadCambioPorCambio
} from '../../lib/registros-api';
import { supabase } from '@/lib/supabase';

export default function ArticleSelect({
    selectedClient,
    selectedLocation,
    selectedArticle,
    setSelectedArticle,
    setLastDispatch,
    setFormData
}) {
    const [articulos, setArticulos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [articleLoading, setArticleLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (selectedLocation) {
            const fetchArticulos = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await loadArticulos(selectedLocation, selectedClient);
                    setArticulos(data);
                } catch (error) {
                    console.error('Error cargando artículos:', error);
                    setError('Error al cargar artículos');
                } finally {
                    setLoading(false);
                }
            };
            fetchArticulos();
        } else {
            setArticulos([]);
        }
    }, [selectedLocation, selectedClient]);

    // Opciones para react-select
    const options = articulos.map(articulo => ({
        value: articulo.id_articulo,
        label: articulo.nombre_articulo
    }));

    // Cambia la firma para react-select
    const handleChange = async (selectedOption) => {
        const articuloId = selectedOption ? selectedOption.value : '';
        setSelectedArticle(articuloId);
        setError(null);

        if (articuloId && selectedLocation) {
            setArticleLoading(true);
            try {
                const { data: sucursalData, error: sucursalError } = await supabase
                    .from('clientes_sucursales')
                    .select('id_cliente_sucursal')
                    .eq('id_cliente_maestro', selectedClient)
                    .eq('id_ubicacion', selectedLocation)
                    .single();

                if (sucursalError) throw sucursalError;

                // Obtener el precio del artículo
                const { data: precioData, error: precioError } = await supabase
                    .from('precios_articulos')
                    .select('precio')
                    .eq('id_articulo', articuloId)
                    .order('fecha_actualizacion', { ascending: false })
                    .limit(1);

                if (precioError) throw precioError;

                const precio = precioData && precioData.length > 0 ? precioData[0].precio : 0;

                // Usar Promise.all para paralelizar las llamadas
                const [despacho, inventario, cambio] = await Promise.all([
                    loadUltimoDespacho(sucursalData.id_cliente_sucursal, articuloId),
                    loadPreviousInventory(sucursalData.id_cliente_sucursal, articuloId),
                    loadCambioPorCambio(sucursalData.id_cliente_sucursal, articuloId)
                ]);

                // Extraer solo la fecha del despacho
                const despachoFecha = despacho && despacho.includes(' - ') ? despacho.split(' - ')[0] : despacho || '';

                setLastDispatch(despachoFecha);

                // Actualizar los valores del formulario
                setFormData('previousInventory', inventario || '');
                setFormData(
                    'dispatched',
                    despacho && despacho.includes('unidades')
                        ? despacho.split(' - ')[1].replace(' unidades', '')
                        : ''
                );
                setFormData('exchange', cambio || '0');
                setFormData('initialTotal', String(
                    (parseFloat(inventario || 0) +
                        parseFloat(
                            despacho && despacho.includes('unidades')
                                ? despacho.split(' - ')[1].replace(' unidades', '')
                                : 0
                        ) +
                        parseFloat(cambio || 0))
                ));
                setFormData('price', precio); // Establecer el precio del artículo
            } catch (error) {
                console.error('Error cargando datos del artículo:', error);
                setError('Error al cargar datos del artículo');
            } finally {
                setArticleLoading(false);
            }
        }
    };

    return (
        <div className="form-group">
            <label htmlFor="articleSelect">Artículo:</label>
            <Select
                id="articleSelect"
                options={options}
                value={options.find(opt => opt.value === selectedArticle) || null}
                onChange={handleChange}
                isClearable
                isLoading={loading}
                placeholder="Seleccione o busque un artículo..."
                noOptionsMessage={() => loading ? 'Cargando artículos...' : 'Sin resultados'}
                isDisabled={!selectedLocation || loading}
            />
            {articleLoading && <p className="loading-text">Cargando datos del artículo...</p>}
            {error && <p className="error-text">{error}</p>}
        </div>
    );
}