// src/app/historial/components/FilterPanel.js
"use client";

import ExportButton from './ExportButton';

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
    return (
        <div className="filter-container">
            {isAdmin && activeTab === 'movimientos' && (
                <div className="form-group">
                    <label htmlFor="filterUser">Usuario:</label>
                    <select
                        id="filterUser"
                        name="userId"
                        className="form-control"
                        value={filters.userId}
                        onChange={onFilterChange}
                    >
                        <option value="">Todos</option>
                        {filterOptions.users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.full_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="filterClient">Cliente:</label>
                <select
                    id="filterClient"
                    name="clientId"
                    className="form-control"
                    value={filters.clientId}
                    onChange={onFilterChange}
                >
                    <option value="">Todos</option>
                    {filterOptions.clients.map(client => (
                        <option key={client.id_cliente_maestro} value={client.id_cliente_maestro}>
                            {client.nombre_cliente}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="filterState">Estado:</label>
                <select
                    id="filterState"
                    name="stateId"
                    className="form-control"
                    value={filters.stateId}
                    onChange={onFilterChange}
                >
                    <option value="">Todos</option>
                    {filterOptions.states.map(state => (
                        <option key={state.id_estado} value={state.id_estado}>
                            {state.nombre_estado}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="filterLocation">Ubicación:</label>
                <select
                    id="filterLocation"
                    name="locationId"
                    className="form-control"
                    value={filters.locationId}
                    onChange={onFilterChange}
                >
                    <option value="">Todos</option>
                    {filterOptions.locations.map(location => (
                        <option key={location.id_ubicacion} value={location.id_ubicacion}>
                            {location.nombre_ubicacion}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="filterArticle">Artículo:</label>
                <select
                    id="filterArticle"
                    name="articleId"
                    className="form-control"
                    value={filters.articleId}
                    onChange={onFilterChange}
                >
                    <option value="">Todos</option>
                    {filterOptions.articles.map(article => (
                        <option key={article.id_articulo} value={article.id_articulo}>
                            {article.nombre_articulo}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="filterDateFrom">Desde:</label>
                <input
                    type="date"
                    id="filterDateFrom"
                    name="dateFrom"
                    className="form-control"
                    value={filters.dateFrom}
                    onChange={onFilterChange}
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
                    onChange={onFilterChange}
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