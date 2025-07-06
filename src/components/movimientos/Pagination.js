import styles from '@/css/Movimientos.module.css';

export default function Pagination({ currentPage, totalPages, onChange }) {
    const handlePrev = () => {
        if (currentPage > 1) {
            onChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onChange(currentPage + 1);
        }
    };

    return (
        <div className={styles.pagination}>
            <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                disabled={currentPage <= 1}
                onClick={handlePrev}
            >
                <i className="fas fa-chevron-left"></i>
            </button>

            <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages}
            </span>

            <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                disabled={currentPage >= totalPages}
                onClick={handleNext}
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
}