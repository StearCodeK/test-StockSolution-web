import { supabaseAdmin } from '../supabase';

export async function loadFilterOptions() {
  try {
    const [users, clients, states, locations, articles] = await Promise.all([
      supabaseAdmin.from('perfiles_usuarios').select('id, nombre, apellido').order('nombre'),
      supabaseAdmin.from('clientes_maestros').select('id_cliente_maestro, nombre_cliente').order('nombre_cliente'),
      supabaseAdmin.from('estados').select('id_estado, nombre_estado').order('nombre_estado'),
      supabaseAdmin.from('ubicaciones').select('id_ubicacion, nombre_ubicacion').order('nombre_ubicacion'),
      supabaseAdmin.from('articulos').select('id_articulo, nombre_articulo').order('nombre_articulo')
    ]);

    return {
      users: users.data || [],
      clients: clients.data || [],
      states: states.data || [],
      locations: locations.data || [],
      articles: articles.data || []
    };
  } catch (error) {
    console.error('Error loading filter options:', error);
    throw error;
  }
}

export async function loadMovimientosData(page = 1, filters = {}) {
  try {
    const itemsPerPage = 20;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabaseAdmin
      .from('registros_usuario')
      .select('*', { count: 'exact' })
      .order('fecha_registro', { ascending: false })
      .range(from, to);

    // Aplicar filtros
    query = await applyFilters(query, filters);

    const { data, count, error } = await query;

    if (error) throw error;

    // Enriquecer datos
    const enrichedData = await enrichMovimientosData(data);

    return { data: enrichedData, count };
  } catch (error) {
    console.error('Error loading movimientos:', error);
    throw error;
  }
}

// Funciones auxiliares (applyFilters, enrichMovimientosData, etc.)
// Similar al código original pero adaptado para Next.js