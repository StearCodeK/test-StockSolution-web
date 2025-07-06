// src/app/api/delete-user/route.js
import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

export async function DELETE(request) {
    try {
        const { userId } = await request.json();

        // 1. Eliminar de perfiles_usuarios (si existe)
        await supabase.from('perfiles_usuarios')
            .delete()
            .eq('id', userId)
            .maybeSingle();

        // 2. Eliminar de usuarios (si existe)
        await supabase.from('usuarios')
            .delete()
            .eq('id_auth', userId)
            .maybeSingle();

        // 3. Eliminar de auth.users (siempre)
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error en delete-user:', error);
        return new Response(JSON.stringify({
            error: error.message,
            details: error
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}