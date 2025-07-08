// src/app/historial/components/FilterPanel.js
"use client";

import ExportButton from './ExportButton';
import Select from 'react-select';
import { useState, useEffect } from 'react';

export default function FilterPanel({
    isAdmin,
    activeTab,
    filters,
    filterOptions,
    onFilterChange,
    onApplyFilters,
    exportData,
    isExporting,
    setIsExporting = { setIsExporting }
}) {
    // Convertir las opciones de filtro al formato que espera react-select
    const [selectOptions, setSelectOptions] = useState({
        users: [],
        clients: [],
        states: [],
        locations: [],
        articles: []
    });

    useEffect(() => {
        setSelectOptions({
            users: filterOptions.users.map(user => ({
                value: user.id,
                label: user.full_name
            })),
            clients: filterOptions.clients.map(client => ({
                value: client.id_cliente_maestro,
                label: client.nombre_cliente
            })),
            states: filterOptions.states.map(state => ({
                value: state.id_estado,
                label: state.nombre_estado
            })),
            locations: filterOptions.locations.map(location => ({
                value: location.id_ubicacion,
                label: location.nombre_ubicacion
            })),
            articles: filterOptions.articles.map(article => ({
                value: article.id_articulo,
                label: article.nombre_articulo
            }))
        });
    }, [filterOptions]);

    // Manejador genérico para react-select
    const handleSelectChange = (selectedOption, { name }) => {
        const syntheticEvent = {
            target: {
                name,
                value: selectedOption ? selectedOption.value : ''
            }
        };
        onFilterChange(syntheticEvent);
    };

    // Manejador para fechas (se mantiene igual)
    const handleDateChange = (e) => {
        onFilterChange(e);
    };

    // Obtener el valor seleccionado actual para react-select
    const getCurrentValue = (options, currentId) => {
        if (!currentId) return null;
        return options.find(option => option.value === currentId);
    };

    return (
        <div className="filter-container">
            {isAdmin && activeTab === 'movimientos' && (
                <div className="form-group">
                    <label htmlFor="filterUser">Usuario:</label>
                    <Select
                        id="filterUser"
                        name="userId"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        value={getCurrentValue(selectOptions.users, filters.userId)}
                        onChange={handleSelectChange}
                        options={selectOptions.users}
                        placeholder="Buscar usuario..."
                        isClearable
                        isSearchable
                    />
                </div>
            )}

            <div className="form-group">
                <label htmlFor="filterClient">Cliente:</label>
                <Select
                    id="filterClient"
                    name="clientId"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    value={getCurrentValue(selectOptions.clients, filters.clientId)}
                    onChange={handleSelectChange}
                    options={selectOptions.clients}
                    placeholder="Buscar cliente..."
                    isClearable
                    isSearchable
                />
            </div>

            <div className="form-group">
                <label htmlFor="filterState">Estado:</label>
                <Select
                    id="filterState"
                    name="stateId"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    value={getCurrentValue(selectOptions.states, filters.stateId)}
                    onChange={handleSelectChange}
                    options={selectOptions.states}
                    placeholder="Buscar estado..."
                    isClearable
                    isSearchable
                />
            </div>

            <div className="form-group">
                <label htmlFor="filterLocation">Ubicación:</label>
                <Select
                    id="filterLocation"
                    name="locationId"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    value={getCurrentValue(selectOptions.locations, filters.locationId)}
                    onChange={handleSelectChange}
                    options={selectOptions.locations}
                    placeholder="Buscar ubicación..."
                    isClearable
                    isSearchable
                />
            </div>

            <div className="form-group">
                <label htmlFor="filterArticle">Artículo:</label>
                <Select
                    id="filterArticle"
                    name="articleId"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    value={getCurrentValue(selectOptions.articles, filters.articleId)}
                    onChange={handleSelectChange}
                    options={selectOptions.articles}
                    placeholder="Buscar artículo..."
                    isClearable
                    isSearchable
                />
            </div>

            <div className="form-group">
                <label htmlFor="filterDateFrom">Desde:</label>
                <input
                    type="date"
                    id="filterDateFrom"
                    name="dateFrom"
                    className="form-control"
                    value={filters.dateFrom}
                    onChange={handleDateChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="filterDateTo">Hasta:</label>
                <input
                    type="date"
                    id="filterDateTo"
                    name="dateTo"
                    className="form-control"
                    value={filters.dateTo}
                    onChange={handleDateChange}
                />
            </div>

            <button
                onClick={onApplyFilters}
                className="btn-primary"
            >
                <i className="fas fa-filter"></i> Aplicar
            </button>

            {isAdmin && activeTab === 'movimientos' && (
                <ExportButton
                    data={exportData}
                    isExporting={isExporting}
                    setIsExporting={setIsExporting}
                />
            )}
        </div>
    );
}