"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthWrapper';
import TabSelector from '@/components/historial/TabSelector';
import FilterPanel from '@/components/historial/FilterPanel';
import HistorialTable from '@/components/historial/HistorialTable';
import MovimientosTable from '@/components/historial/MovimientosTable';
import ExportButton from '@/components/historial/ExportButton';

export default function HistorialPage() {
    const [activeTab, setActiveTab] = useState('historial');
    const [historialData, setHistorialData] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        clients: [],
        states: [],
        locations: [],
        articles: [],
        users: []
    });
    const [filters, setFilters] = useState({
        clientId: '',
        stateId: '',
        locationId: '',
        articleId: '',
        dateFrom: '',
        dateTo: '',
        userId: ''
    });
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { isAdmin, loading: authLoading, user, authChecked } = useAuth();
    const userId = user?.id || null;

    // Memoized data fetching functions
    const getUsers = useCallback(async () => {
        try {
            const { data: perfiles, error: perfilesError } = await supabase
                .from('perfiles_usuarios')
                .select('id, nombre, apellido')
                .order('nombre');

            if (perfilesError) throw perfilesError;
            if (!perfiles) return [];

            const { data: usuariosData, error: usuariosError } = await supabase
                .from('usuarios')
                .select('id_usuario, id_auth');

            if (usuariosError) throw usuariosError;

            return usuariosData?.map(usuario => {
                const perfil = perfiles.find(p => p.id === usuario.id_auth);
                return {
                    id: usuario.id_usuario,
                    nombre: perfil?.nombre || 'N/A',
                    apellido: perfil?.apellido || '',
                    full_name: perfil ? `${perfil.nombre} ${perfil.apellido}`.trim() : 'N/A'
                };
            }) || [];

        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }, []);

    const getClients = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('clientes_maestros')
                .select('id_cliente_maestro, nombre_cliente')
                .order('nombre_cliente');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting clients:', error);
            throw error;
        }
    }, []);

    const getStates = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('estados')
                .select('id_estado, nombre_estado')
                .order('nombre_estado');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting states:', error);
            throw error;
        }
    }, []);

    const getLocations = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('ubicaciones')
                .select('id_ubicacion, nombre_ubicacion')
                .order('nombre_ubicacion');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting locations:', error);
            throw error;
        }
    }, []);

    const getArticles = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('articulos')
                .select('id_articulo, nombre_articulo')
                .order('nombre_articulo');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting articles:', error);
            throw error;
        }
    }, []);

    // Memoized data enrichment functions
    const getUsersData = useCallback(async (userIds) => {
        if (userIds.length === 0) return {};

        try {
            const { data: usuariosData, error: usuariosError } = await supabase
                .from('usuarios')
                .select('id_usuario, id_auth')
                .in('id_usuario', userIds);

            if (usuariosError) throw usuariosError;
            if (!usuariosData) return {};

            const authIds = usuariosData.map(user => user.id_auth);
            const { data: perfiles, error: perfilesError } = await supabase
                .from('perfiles_usuarios')
                .select('id, nombre, apellido')
                .in('id', authIds);

            if (perfilesError) throw perfilesError;

            const usuariosMap = {};
            usuariosData.forEach(usuario => {
                const perfil = perfiles?.find(p => p.id === usuario.id_auth);
                if (perfil) {
                    usuariosMap[usuario.id_usuario] = {
                        nombre: perfil.nombre,
                        apellido: perfil.apellido
                    };
                }
            });

            return usuariosMap;
        } catch (error) {
            console.error('Error getting users data:', error);
            return {};
        }
    }, []);

    const getClientesData = useCallback(async (clienteIds) => {
        if (clienteIds.length === 0) return {};

        try {
            const { data: clientes, error } = await supabase
                .from('clientes_maestros')
                .select('id_cliente_maestro, nombre_cliente')
                .in('id_cliente_maestro', clienteIds);

            if (error || !clientes) return {};

            const clientesMap = {};
            clientes.forEach(cliente => {
                clientesMap[cliente.id_cliente_maestro] = cliente.nombre_cliente;
            });

            return clientesMap;
        } catch (error) {
            console.error('Error getting clients data:', error);
            return {};
        }
    }, []);

    const getEstadosData = useCallback(async (estadoIds) => {
        if (estadoIds.length === 0) return {};

        try {
            const { data: estados, error } = await supabase
                .from('estados')
                .select('id_estado, nombre_estado')
                .in('id_estado', estadoIds);

            if (error || !estados) return {};

            const estadosMap = {};
            estados.forEach(estado => {
                estadosMap[estado.id_estado] = estado.nombre_estado;
            });

            return estadosMap;
        } catch (error) {
            console.error('Error getting states data:', error);
            return {};
        }
    }, []);

    const getUbicacionesData = useCallback(async (ubicacionIds) => {
        if (ubicacionIds.length === 0) return {};

        try {
            const { data: ubicaciones, error } = await supabase
                .from('ubicaciones')
                .select('id_ubicacion, nombre_ubicacion, id_estado')
                .in('id_ubicacion', ubicacionIds);

            if (error || !ubicaciones) return {};

            const estadoIds = [...new Set(ubicaciones.map(u => u.id_estado).filter(Boolean))];
            const estados = await getEstadosData(estadoIds);

            const ubicacionesMap = {};
            ubicaciones.forEach(ubicacion => {
                ubicacionesMap[ubicacion.id_ubicacion] = {
                    nombre: ubicacion.nombre_ubicacion,
                    estado: estados[ubicacion.id_estado] || 'N/A',
                    estadoId: ubicacion.id_estado
                };
            });

            return ubicacionesMap;
        } catch (error) {
            console.error('Error getting locations data:', error);
            return {};
        }
    }, [getEstadosData]);

    const getSucursalesData = useCallback(async (sucursalIds) => {
        if (sucursalIds.length === 0) return {};

        try {
            const { data: sucursales, error } = await supabase
                .from('clientes_sucursales')
                .select(`
                    id_cliente_sucursal,
                    id_cliente_maestro,
                    id_ubicacion
                `)
                .in('id_cliente_sucursal', sucursalIds);

            if (error || !sucursales) return {};

            const clienteIds = [...new Set(sucursales.map(s => s.id_cliente_maestro).filter(Boolean))];
            const ubicacionIds = [...new Set(sucursales.map(s => s.id_ubicacion).filter(Boolean))];

            const [clientes, ubicaciones] = await Promise.all([
                getClientesData(clienteIds),
                getUbicacionesData(ubicacionIds)
            ]);

            const sucursalesMap = {};
            sucursales.forEach(sucursal => {
                const ubicacionData = ubicaciones[sucursal.id_ubicacion] || {};
                sucursalesMap[sucursal.id_cliente_sucursal] = {
                    cliente: clientes[sucursal.id_cliente_maestro] || 'N/A',
                    ubicacion: ubicacionData.nombre || 'N/A',
                    estado: ubicacionData.estado || 'N/A',
                    clienteId: sucursal.id_cliente_maestro,
                    ubicacionId: sucursal.id_ubicacion,
                    estadoId: ubicacionData.estadoId || null
                };
            });

            return sucursalesMap;
        } catch (error) {
            console.error('Error getting branch data:', error);
            return {};
        }
    }, [getClientesData, getUbicacionesData]);

    const getArticulosData = useCallback(async (articuloIds) => {
        if (articuloIds.length === 0) return {};

        try {
            const { data: articulos, error } = await supabase
                .from('articulos')
                .select('id_articulo, nombre_articulo')
                .in('id_articulo', articuloIds);

            if (error || !articulos) return {};

            const articulosMap = {};
            articulos.forEach(articulo => {
                articulosMap[articulo.id_articulo] = articulo.nombre_articulo;
            });

            return articulosMap;
        } catch (error) {
            console.error('Error getting articles data:', error);
            return {};
        }
    }, []);

    const enrichHistorialData = useCallback(async (data, includeUserData = false) => {
        if (!data || data.length === 0) return [];

        try {
            const sucursalIds = [...new Set(data.map(item => item.id_cliente_sucursal).filter(Boolean))];
            const articuloIds = [...new Set(data.map(item => item.id_articulo).filter(Boolean))];
            const userIds = includeUserData ? [...new Set(data.map(item => item.id_usuario).filter(Boolean))] : [];

            const [sucursalesData, articulosData, usersData] = await Promise.all([
                getSucursalesData(sucursalIds),
                getArticulosData(articuloIds),
                includeUserData ? getUsersData(userIds) : Promise.resolve({})
            ]);

            return data.map(item => ({
                ...item,
                sucursal: sucursalesData[item.id_cliente_sucursal] || {
                    cliente: 'N/A',
                    estado: 'N/A',
                    ubicacion: 'N/A',
                    clienteId: null,
                    ubicacionId: null,
                    estadoId: null
                },
                articulo: articulosData[item.id_articulo] || 'N/A',
                usuario: usersData[item.id_usuario] ?
                    `${usersData[item.id_usuario].nombre} ${usersData[item.id_usuario].apellido}`.trim() :
                    'N/A'
            }));

        } catch (error) {
            console.error('Error enriching data:', error);
            return data.map(item => ({
                ...item,
                sucursal: {
                    cliente: 'N/A',
                    estado: 'N/A',
                    ubicacion: 'N/A',
                    clienteId: null,
                    ubicacionId: null,
                    estadoId: null
                },
                articulo: 'N/A',
                usuario: 'N/A'
            }));
        }
    }, [getSucursalesData, getArticulosData, getUsersData]);

    const applyClientSideFilters = useCallback((data, activeFilters) => {
        if (!data) return [];

        return data.filter(item => {
            if (activeFilters.clientId && item.sucursal?.clienteId !== activeFilters.clientId) {
                return false;
            }

            if (activeFilters.stateId && item.sucursal?.estadoId !== activeFilters.stateId) {
                return false;
            }

            if (activeFilters.locationId && item.sucursal?.ubicacionId !== activeFilters.locationId) {
                return false;
            }

            return true;
        });
    }, []);

    const loadFilterOptions = useCallback(async () => {
        try {
            const promises = [
                getClients(),
                getStates(),
                getLocations(),
                getArticles()
            ];

            if (isAdmin) {
                promises.push(getUsers());
            }

            const results = await Promise.allSettled(promises);

            setFilterOptions({
                clients: results[0].status === 'fulfilled' ? results[0].value : [],
                states: results[1].status === 'fulfilled' ? results[1].value : [],
                locations: results[2].status === 'fulfilled' ? results[2].value : [],
                articles: results[3].status === 'fulfilled' ? results[3].value : [],
                users: isAdmin && results[4]?.status === 'fulfilled' ? results[4].value : []
            });

        } catch (error) {
            console.error('Error loading filter options:', error);
            setError('Error al cargar las opciones de filtro');
            throw error;
        }
    }, [isAdmin, getClients, getStates, getLocations, getArticles, getUsers]);

    const loadHistorialData = useCallback(async (customFilters = null) => {
        if (!user?.id) {
            console.warn("Usuario no disponible aún, omitiendo carga de historial");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const activeFilters = customFilters || filters;
            const isMovimientosTab = activeTab === 'movimientos';

            // Primero obtenemos el id_usuario (integer) correspondiente al usuario autenticado
            let idUsuarioInteger = null;
            if (user?.id) {
                const { data: usuarioData, error: usuarioError } = await supabase
                    .from('usuarios')
                    .select('id_usuario')
                    .eq('id_auth', user.id)
                    .single();

                if (usuarioError) throw usuarioError;
                if (!usuarioData) throw new Error('No se encontró el usuario en la tabla usuarios');

                idUsuarioInteger = usuarioData.id_usuario;
            }

            // Construir la consulta base
            let query = supabase
                .from('registros_usuario')
                .select(`
                id_registro,
                id_usuario,
                id_cliente_sucursal,
                id_articulo,
                fecha_registro,
                inventario_anterior,
                despacho,
                cambio_por_cambio,
                total_inicial,
                inventario_final,
                devolucion_vencimiento,
                devolucion_calidad,
                venta,
                sugerido,
                precio_pedido,
                cantidad_pedida
            `)
                .order('fecha_registro', { ascending: false });

            // Aplicar filtros
            if (activeFilters.articleId) {
                query = query.eq('id_articulo', activeFilters.articleId);
            }

            if (activeFilters.dateFrom) {
                query = query.gte('fecha_registro', activeFilters.dateFrom);
            }

            if (activeFilters.dateTo) {
                query = query.lte('fecha_registro', `${activeFilters.dateTo}T23:59:59`);
            }

            if (isMovimientosTab) {
                if (activeFilters.userId) {
                    // Para el filtro de usuario, ya debería ser el id_usuario (integer)
                    query = query.eq('id_usuario', activeFilters.userId);
                }
            } else if (idUsuarioInteger) {
                // Usamos el id_usuario (integer) obtenido previamente
                query = query.eq('id_usuario', idUsuarioInteger);
            }

            // Ejecutar consulta
            const { data, error: queryError } = await query;

            if (queryError) {
                console.error('Query error details:', {
                    message: queryError.message,
                    details: queryError.details,
                    code: queryError.code
                });
                throw new Error(`Error al cargar datos: ${queryError.message}`);
            }

            if (!data) {
                throw new Error('No se recibieron datos de la consulta');
            }

            if (!Array.isArray(data)) {
                throw new Error('Los datos recibidos no tienen el formato esperado');
            }

            const enrichedData = await enrichHistorialData(data, isMovimientosTab);
            const filteredData = applyClientSideFilters(enrichedData, activeFilters);

            setHistorialData(filteredData);
        } catch (error) {
            console.error('Error loading history data:', error);
            setError(error.message || 'Error al cargar los registros. Intente nuevamente.');
            setHistorialData([]);
        } finally {
            setIsLoading(false);
        }
    }, [user, filters, activeTab, enrichHistorialData, applyClientSideFilters]);

    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const applyFilters = useCallback(() => {
        loadHistorialData();
    }, [loadHistorialData]);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    // Main effect for loading data
    useEffect(() => {
        if (!authChecked || authLoading || !userId) return;

        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                await loadFilterOptions();
                await loadHistorialData();
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Error al cargar los datos iniciales");
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [authChecked, authLoading, userId, isAdmin, loadFilterOptions, loadHistorialData]);

    // Effect for tab changes
    useEffect(() => {
        if (authChecked && !authLoading && userId) {
            loadHistorialData();
        }
    }, [activeTab, authChecked, authLoading, userId, loadHistorialData]);

    return (
        <div className="historial-page">
            <div className="main-content">
                <div className="historial-container">
                    <div className="section-container">


                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {isAdmin && (
                            <TabSelector
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                            />
                        )}

                        <FilterPanel
                            isAdmin={isAdmin}
                            activeTab={activeTab}
                            filters={filters}
                            filterOptions={filterOptions}
                            onFilterChange={handleFilterChange}
                            onApplyFilters={applyFilters}
                            exportData={historialData}
                            isExporting={isExporting}
                            setIsExporting={setIsExporting}
                        />



                        {activeTab === 'historial' ? (
                            <HistorialTable
                                data={historialData}
                                isAdmin={isAdmin}
                                isLoading={isLoading}
                            />
                        ) : (
                            <MovimientosTable
                                data={historialData}
                                isAdmin={isAdmin}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}