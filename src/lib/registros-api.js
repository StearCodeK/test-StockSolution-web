import { supabase } from '@/lib/supabase';

// Funciones para cargar datos
export async function loadClientes() {
    const { data, error } = await supabase
        .from('clientes_maestros')
        .select('id_cliente_maestro, nombre_cliente')
        .order('nombre_cliente', { ascending: true });

    if (error) throw error;
    return data;
}

export async function loadEstados(clienteId) {
    const { data, error } = await supabase
        .from('clientes_sucursales')
        .select(`
      id_cliente_maestro,
      ubicaciones:ubicaciones(
        id_estado,
        estados!inner(
          id_estado,
          nombre_estado
        )
      )
    `)
        .eq('id_cliente_maestro', clienteId);

    if (error) throw error;

    const estadosUnicos = new Map();
    data.forEach(item => {
        if (item.ubicaciones?.estados) {
            const estado = item.ubicaciones.estados;
            estadosUnicos.set(estado.id_estado, estado.nombre_estado);
        }
    });

    return Array.from(estadosUnicos, ([id, nombre]) => ({ id, nombre }));
}

export async function loadUbicaciones(estadoId, clienteId) {
    const { data, error } = await supabase
        .from('clientes_sucursales')
        .select(`
      id_ubicacion,
      ubicaciones!inner(
        id_ubicacion,
        nombre_ubicacion,
        id_estado
      )
    `)
        .eq('id_cliente_maestro', clienteId)
        .eq('ubicaciones.id_estado', estadoId);

    if (error) throw error;
    return data.map(item => item.ubicaciones);
}

export async function loadArticulos(ubicacionId, clienteId) {
    const { data: sucursalData, error: sucursalError } = await supabase
        .from('clientes_sucursales')
        .select('id_cliente_sucursal')
        .eq('id_cliente_maestro', clienteId)
        .eq('id_ubicacion', ubicacionId)
        .single();

    if (sucursalError) throw sucursalError;

    const { data: despachosData, error: despachosError } = await supabase
        .from('despachos')
        .select(`
      id_articulo,
      articulos:articulos(
        id_articulo,
        nombre_articulo
      )
    `)
        .eq('id_cliente_sucursal', sucursalData.id_cliente_sucursal)
        .not('id_articulo', 'is', null);

    if (despachosError) throw despachosError;

    const articulosUnicos = [...new Map(
        despachosData
            .filter(item => item.articulos)
            .map(item => [item.articulos.id_articulo, item.articulos])
    ).values()].sort((a, b) => a.nombre_articulo.localeCompare(b.nombre_articulo));

    return articulosUnicos;
}

export async function loadUltimoDespacho(clienteSucursalId, articuloId) {
    const { data, error } = await supabase
        .from('despachos')
        .select('fecha_despacho, unidades_despachadas')
        .eq('id_cliente_sucursal', clienteSucursalId)
        .eq('id_articulo', articuloId)
        .order('fecha_despacho', { ascending: false })
        .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
        const despacho = data[0];
        const fechaDespacho = new Date(despacho.fecha_despacho + 'T00:00:00');
        const fechaFormateada = fechaDespacho.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        return `${fechaFormateada} - ${despacho.unidades_despachadas} unidades`;
    }
    return 'No hay registros de despacho para este artículo';
}

export async function loadPreviousInventory(clienteSucursalId, articuloId) {
    const { data, error } = await supabase
        .from('registros_usuario')
        .select('inventario_final')
        .eq('id_cliente_sucursal', clienteSucursalId)
        .eq('id_articulo', articuloId)
        .order('fecha_registro', { descending: true })
        .limit(1);

    if (error) throw error;
    return data.length > 0 ? data[0].inventario_final : '';
}

export async function loadCambioPorCambio(clienteSucursalId, articuloId) {
    const { data: despachoData, error: despachoError } = await supabase
        .from('despachos')
        .select('fecha_despacho')
        .eq('id_cliente_sucursal', clienteSucursalId)
        .eq('id_articulo', articuloId)
        .order('fecha_despacho', { ascending: false })
        .limit(1);

    if (despachoError || !despachoData?.length) return '0';

    const { data: devolucionData, error: devolucionError } = await supabase
        .from('devoluciones')
        .select('fecha, unidades_devueltas')
        .eq('id_cliente_sucursal', clienteSucursalId)
        .eq('id_articulo', articuloId)
        .order('fecha', { ascending: false })
        .limit(1);

    if (devolucionError || !devolucionData?.length) return '0';

    const fechaDespacho = despachoData[0].fecha_despacho.trim();
    const fechaDevolucion = devolucionData[0].fecha.trim();
    const unidadesDevueltas = parseFloat(devolucionData[0].unidades_devueltas) || 0;

    return fechaDespacho === fechaDevolucion ? unidadesDevueltas.toString() : '0';
}

export async function saveRegistro({ selectedClient, selectedLocation, selectedArticle, formData }) {
    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuario no autenticado');

    // 2. Obtener id_usuario
    const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('id_auth', user.id);

    if (usuarioError || !usuarioData?.length) throw new Error('Usuario no encontrado');
    const idUsuario = usuarioData[0].id_usuario;

    // 3. Obtener id_cliente_sucursal
    const { data: sucursalData, error: sucursalError } = await supabase
        .from('clientes_sucursales')
        .select('id_cliente_sucursal')
        .eq('id_cliente_maestro', selectedClient)
        .eq('id_ubicacion', selectedLocation);

    if (sucursalError || !sucursalData?.length) throw new Error('Sucursal no encontrada');
    const idClienteSucursal = sucursalData[0].id_cliente_sucursal;

    // 4. Preparar datos del registro
    const registroData = {
        id_usuario: idUsuario,
        id_cliente_sucursal: idClienteSucursal,
        id_articulo: selectedArticle,
        fecha_inventario: formData.inventoryDate,
        fecha_proximo_despacho: formData.nextDispatch,
        inventario_anterior: parseFloat(formData.previousInventory) || 0,
        despacho: parseFloat(formData.dispatched) || 0,
        cambio_por_cambio: parseFloat(formData.exchange) || 0,
        total_inicial: parseFloat(formData.initialTotal) || 0,
        inventario_final: parseFloat(formData.finalInventory) || 0,
        devolucion_vencimiento: parseFloat(formData.expirationReturns) || 0,
        devolucion_calidad: parseFloat(formData.qualityReturns) || 0,
        venta: parseFloat(formData.sales) || 0,
        sugerido: parseFloat(formData.suggested) || 0,
        precio_pedido: parseFloat(formData.price) || 0,
        cantidad_pedida: parseFloat(formData.quantity) || 0,
        total_pedido: parseFloat(formData.orderTotal) || 0
    };

    // 5. Insertar registro
    const { error } = await supabase
        .from('registros_usuario')
        .insert([registroData]);

    if (error) throw error;
}