export default function AccessRequestsTable({ requests, onApprove, onReject }) {
  if (!requests || requests.length === 0) {
    return <p>No hay solicitudes pendientes</p>;
  }

  return (
    <table className="admin-table w-full">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Empresa</th>
          <th>Solicitud</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {requests.map(request => (
          <tr key={request.id}>
            <td>{request.nombre} {request.apellido}</td>
            <td>{request.email}</td>
            <td>{request.empresa || 'N/A'}</td>
            <td>{new Date(request.created_at).toLocaleDateString()}</td>
            <td className="actions-cell">
              <button
                className="btn btn-success btn-sm"
                onClick={() => onApprove(request)}
              >
                <i className="fas fa-check"></i> Aprobar
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => onReject(request.id)}
              >
                <i className="fas fa-times"></i> Rechazar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}