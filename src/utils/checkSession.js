import { supabase } from '../lib/supabase';

export async function checkSession() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            if (!error.message.includes('Auth session missing')) {
                console.error('Error verificando sesión:', error);
            }
            return;
        }

        if (user && (typeof window !== 'undefined' && (window.location.pathname.includes('index') || window.location.pathname === '/'))) {
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.error('Error inesperado:', error);
    }
}