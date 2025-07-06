'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'

export default function ForgotPasswordModal({ onClose }) {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm()
    const [success, setSuccess] = useState(false)

    const onSubmit = async ({ email }) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) throw error

            setSuccess(true)
        } catch (error) {
            alert(`Error: ${error.message}`)
        }
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    if (success) {
        return (
            <div className="modal active" onClick={handleOverlayClick}>
                <div className="modal-content">
                    <span className="close-modal" onClick={onClose}>&times;</span>
                    <div className="modal-body">
                        <i className="fas fa-check-circle success-icon" style={{ color: '#10B981', fontSize: '3rem', textAlign: 'center', display: 'block', marginBottom: '1rem' }}></i>
                        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Solicitud Recibida</h2>
                        <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            El administrador revisará tu solicitud y te notificará por correo
                            electrónico cuando tu nueva contraseña esté lista.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="modal active" onClick={handleOverlayClick}>
            <div className="modal-content">
                <span className="close-modal" onClick={onClose}>&times;</span>
                <div className="modal-body">
                    <h2 style={{ marginBottom: '1rem' }}>Recuperar Contraseña</h2>
                    <p style={{ marginBottom: '1.5rem' }}>
                        Ingresa tu correo electrónico y el administrador revisará tu solicitud.
                    </p>
                    <form className="rhf-form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="input-group">
                            <i className="fas fa-envelope"></i>
                            <input
                                {...register('email', { required: true })}
                                type="email"
                                placeholder="Correo electrónico"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{ width: '100%', marginTop: '1.5rem' }}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Enviando...
                                </>
                            ) : (
                                'Enviar solicitud'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}