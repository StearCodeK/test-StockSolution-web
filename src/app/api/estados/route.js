// app/api/estados/route.js
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');

    if (!clienteId) {
        return new Response(JSON.stringify({ error: 'clienteId is required' }), {
            status: 400,
        });
    }

    try {
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

        const result = Array.from(estadosUnicos, ([id, nombre]) => ({ id, nombre }));

        return new Response(JSON.stringify(result), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}