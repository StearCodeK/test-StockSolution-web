// src/app/historial/components/TabSelector.js
export default function TabSelector({ activeTab, onTabChange }) {
    return (
        <div className="admin-tabs">
            <div className="tabs-header">
                <button
                    className={`tab-button ${activeTab === 'historial' ? 'active-tab' : ''}`}
                    onClick={() => onTabChange('historial')}
                >
                    Historial
                </button>
                <button
                    className={`tab-button ${activeTab === 'movimientos' ? 'active-tab' : ''}`}
                    onClick={() => onTabChange('movimientos')}
                >
                    Movimientos
                </button>
            </div>
        </div>
    );
}