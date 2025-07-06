export default function ActiveUsersTable({ users, onDeleteUser }) {
    if (!users || users.length === 0) {
        return <p>No hay usuarios activos</p>;
    }

    return (
        <table className="admin-table w-full">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Registro</th>
                    <th>Último acceso</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.nombre} {user.apellido}</td>
                        <td>{user.email}</td>
                        <td>{user.rol}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>{user.last_sign_in ?
                            new Date(user.last_sign_in).toLocaleString() :
                            'Nunca'}</td>
                        <td className="actions-cell">
                            <button
                                className="btn btn-error btn-sm"
                                onClick={() => onDeleteUser(user)}
                                disabled={user.rol === 'admin'} // Opcional: deshabilitar para admins
                                title={user.rol === 'admin' ? 'No se pueden eliminar admins' : ''}
                            >
                                <i className="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}