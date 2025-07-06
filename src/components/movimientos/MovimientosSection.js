import { useState, useEffect } from 'react';
import styles from '@/css/Movimientos.module.css';
import Filters from './Filters';
import MovimientosTable from './MovimientosTable';
import Pagination from './Pagination';
import {
    loadFilterOptions,
    loadMovimientosData,
    exportToExcel
} from '../../lib/movimientos/api';

export default function MovimientosSection() {
    const [filters, setFilters] = useState({});
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });
    const [filterOptions, setFilterOptions] = useState({
        users: [],
        clients: [],
        states: [],
        locations: [],
        articles: []
    });

    useEffect(() => {
        const initData = async () => {
            try {
                const options = await loadFilterOptions();
                setFilterOptions(options);

                const { data, count } = await loadMovimientosData(1);
                setMovimientos(data);
                setPageInfo(prev => ({
                    ...prev,
                    totalPages: Math.ceil(count / 20),
                    totalItems: count
                }));
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, []);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = async (page) => {
        setLoading(true);
        try {
            const { data, count } = await loadMovimientosData(page, filters);
            setMovimientos(data);
            setPageInfo(prev => ({
                ...prev,
                currentPage: page,
                totalPages: Math.ceil(count / 20),
                totalItems: count
            }));
        } catch (error) {
            console.error('Error changing page:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            await exportToExcel(filters);
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Movimientos de Usuarios</h3>

            <Filters
                options={filterOptions}
                onChange={handleFilterChange}
                onExport={handleExport}
            />

            <MovimientosTable
                data={movimientos}
                loading={loading}
            />

            <Pagination
                currentPage={pageInfo.currentPage}
                totalPages={pageInfo.totalPages}
                onChange={handlePageChange}
            />
        </div>
    );
}