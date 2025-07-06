// components/importacion/ImportDataForm.js
"use client";

import { useState } from "react";

export default function ImportDataForm() {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Por favor selecciona un archivo");
            return;
        }

        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            const formData = new FormData();
            formData.append('file', file);

            setMessage("Iniciando migración de datos...");

            const response = await fetch('/api/importar', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al procesar el archivo");
            }

            setMessage("¡Migración completada con éxito!");
        } catch (err) {
            console.error("Error al importar:", err);
            setError(err.message || "Error al procesar el archivo");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="import-form">
            <div className="form-group">
                <label htmlFor="data-file">Seleccionar archivo Excel:</label>
                <input
                    id="data-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files[0])}
                    disabled={isLoading}
                />
                <p className="file-hint">Formatos soportados: .xlsx, .xls</p>
            </div>

            <button type="submit" disabled={isLoading} className="submit-button">
                {isLoading ? "Procesando..." : "Importar Datos"}
            </button>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
        </form>
    );
}