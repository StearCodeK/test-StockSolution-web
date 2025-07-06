// app/importacion/page.js
"use client";

import { useAuth } from "@/components/layout/AuthWrapper";
import ImportDataForm from "@/components/importacion/ImportDataForm";
import ImportPricesForm from "@/components/importacion/ImportPricesForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ImportacionPage() {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAdmin) {
        return (
            <div className="unauthorized-container">
                <h2>Acceso no autorizado</h2>
                <p>No tienes permisos para acceder a esta sección.</p>
            </div>
        );
    }

    return (
        <div className="importacion-container">

            <div className="importacion-grid">
                <div className="import-card">
                    <h2>Importar Datos a la Base de Datos</h2>
                    <ImportDataForm />
                </div>
                <div className="import-card">
                    <h2>Actualizar Precios de Productos</h2>
                    <ImportPricesForm />
                </div>
            </div>
        </div>
    );
}