import { useState } from 'react';
import AccessRequestsTable from './AccessRequestsTable';
import ActiveUsersTable from './ActiveUsersTable';

export default function AdminTabs({
    accessRequests,
    activeUsers,
    onApproveRequest,
    onRejectRequest,
    onDeleteUser,
    onRefresh
}) {
    const [activeTab, setActiveTab] = useState('requests');

    return (
        <div className="admin-tabs">
            <div className="tabs-header flex border-b mb-4">
                <button
                    className={`tab-button px-4 py-2 ${activeTab === 'requests' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Solicitudes Pendientes
                </button>
                <button
                    className={`tab-button px-4 py-2 ${activeTab === 'users' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Usuarios Activos
                </button>
            </div>

            <div className="flex justify-end mb-4">
                <button
                    onClick={onRefresh}
                    className="btn-primary"
                >
                    <i className="fas fa-sync-alt"></i> Actualizar
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'requests' ? (
                    <AccessRequestsTable
                        requests={accessRequests}
                        onApprove={onApproveRequest}
                        onReject={onRejectRequest}
                    />
                ) : (
                    <ActiveUsersTable
                        users={activeUsers}
                        onDeleteUser={onDeleteUser}
                    />
                )}
            </div>
        </div>
    );
}