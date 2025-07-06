'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ActivitySection() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRecentActivity();
    }, []);

    const loadRecentActivity = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('registros_usuario')
                .select(`
                    fecha_registro,
                    articulos(nombre_articulo),
                    clientes_sucursales(cod_cliente),
                    inventario_final
                `)
                .order('fecha_registro', { ascending: false })
                .limit(5);

            if (error) {
                throw error;
            }

            setActivities(data || []);
        } catch (err) {
            console.error('Error al cargar actividad reciente:', err);
            setError('Error al cargar actividad reciente');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Cargando actividad reciente...</p>;
    if (error) return <p>{error}</p>;
    if (activities.length === 0) return <p>No hay actividad reciente</p>;

    return (
        <section className="recent-activity section-container">
            <h3 className="section-title">Actividad Reciente</h3>
            <div className="activity-list">
                {activities.map((item, index) => (
                    <div key={index} className="activity-item">
                        <p>
                            <strong>{item.articulos?.nombre_articulo || 'Artículo desconocido'}</strong> -
                            Inventario: {item.inventario_final} -
                            Cliente: {item.clientes_sucursales?.cod_cliente || 'Desconocido'} -
                            <small>{new Date(item.fecha_registro).toLocaleString()}</small>
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}