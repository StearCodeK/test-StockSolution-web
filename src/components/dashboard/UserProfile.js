'use client';

import { useState } from 'react';

export default function UserProfile({ user, onLogout }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    if (!user) {
        return null;
    }

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setDropdownOpen(!dropdownOpen);
    };

    const closeDropdown = () => setDropdownOpen(false);

    const displayName = user.nombre ?
        `${user.nombre} ${user.apellido || ''}`.trim() :
        user.email || 'Usuario';

    return (
        <div className="user-profile" onClick={toggleDropdown}>
            <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`}
                alt="Usuario"
                className="user-avatar"
            />
            <div className="user-info">
                <span className="user-name">{displayName}</span>
                <small className="user-role">
                    {user.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </small>
            </div>
            <div className={`user-dropdown ${dropdownOpen ? 'open' : ''}`}>
                <i className="fas fa-chevron-down"></i>
            </div>

            {dropdownOpen && (
                <div className="dropdown-content">
                    <div className="profile-details">
                        <h4>Información del perfil</h4>
                        <p><strong>Nombre:</strong> {user.nombre || 'No especificado'}</p>
                        <p><strong>Apellido:</strong> {user.apellido || 'No especificado'}</p>
                        <p><strong>Teléfono:</strong> {user.telefono || 'No especificado'}</p>
                        <p><strong>Email:</strong> {user.email || 'No especificado'}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button
                        className="logout-button"
                        onClick={(e) => {
                            e.preventDefault();
                            onLogout();
                        }}
                    >
                        <i className="fas fa-sign-out-alt"></i> Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
}