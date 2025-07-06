// app/api/importar/ruta.js
import { NextResponse } from 'next/server';
import { DataMigration } from '@/lib/migration';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Configuración de Supabase no encontrada");
        }

        const migration = new DataMigration(supabaseUrl, supabaseKey);
        await migration.migrate(file);

        return NextResponse.json({ message: 'Migración completada con éxito' });
    } catch (error) {
        console.error('Error al importar:', error);
        return NextResponse.json({ error: error.message || 'Error al importar' }, { status: 500 });
    }
}