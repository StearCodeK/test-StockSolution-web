// src/app/api/approve/route.js
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
    const { requestId, email, nombre, apellido, password } = await request.json()

    try {
        // Verificar que el usuario que hace la solicitud es admin
        const { data: { user } } = await supabaseAdmin.auth.getUser()
        const { data: profile } = await supabaseAdmin
            .from('perfiles_usuarios')
            .select('rol')
            .eq('id', user.id)
            .single()

        if (profile?.rol !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        // Resto de la lógica de aprobación...

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}