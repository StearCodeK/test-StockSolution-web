import { useState } from 'react';

export default function PasswordModal({ onConfirm, onCancel }) {
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showRequirements, setShowRequirements] = useState(true); // Nuevo estado

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        return strength;
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setErrorMessage('');
        // Mostrar los requisitos mientras el usuario escribe
        setShowRequirements(true);
    };

    const handleConfirm = () => {
        let error = '';

        if (password.length < 8) {
            error = 'La contraseña debe tener al menos 8 caracteres';
        } else if (!/[A-Z]/.test(password)) {
            error = 'Debe contener al menos una mayúscula';
        } else if (!/[0-9]/.test(password)) {
            error = 'Debe contener al menos un número';
        }

        if (error) {
            setErrorMessage(error);
            return;
        }

        onConfirm(password);
    };

    const strength = calculatePasswordStrength(password);

    return (
        <div className="password-modal">
            <div className="modal-content shadow-lg rounded-lg" style={{ maxWidth: '450px' }}>
                <div className="p-4">
                    <h3 className="text-xl font-semibold mb-3">Definir Contraseña</h3>
                    <p className="text-sm text-light mb-4">
                        Ingrese la contraseña para el nuevo usuario:
                    </p>

                    <div className="form-group mb-4">
                        <div className="password-input-container relative">
                            <input
                                type="password"
                                className="form-control w-full"
                                placeholder="Mínimo 8 caracteres"
                                value={password}
                                onChange={handlePasswordChange}
                                required
                            />
                            <div className="password-strength flex gap-1 mt-2">
                                {[0, 1, 2].map(index => (
                                    <span
                                        key={index}
                                        className="strength-bar flex-1 h-2 rounded"
                                        style={{
                                            backgroundColor: index < strength ?
                                                ['#ff4d4d', '#ffcc00', '#22cc44'][index] : '#e0e0e0'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Mostrar los requisitos siempre */}
                        {showRequirements && (
                            <div className="password-requirements text-xs text-gray-600 mt-2">
                                <p>La contraseña debe cumplir con:</p>
                                <ul className="list-disc pl-5 mt-1">
                                    <li className={password.length >= 8 ? 'text-green-500' : ''}>
                                        Mínimo 8 caracteres
                                    </li>
                                    <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>
                                        Al menos una mayúscula
                                    </li>
                                    <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>
                                        Al menos un número
                                    </li>
                                </ul>
                            </div>
                        )}

                        {errorMessage && (
                            <p className="error-message text-sm text-red-500 mt-1">
                                {errorMessage}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleConfirm}
                            className="btn btn-success"
                        >
                            Confirmar
                        </button>

                        <button
                            onClick={onCancel}
                            className="btn btn-error"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}