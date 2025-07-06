'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'

export default function SignupForm({ onShowLogin, activeForm }) {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
        reset
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            nombre: '',
            apellido: '',
            email: '',
            empresa: '',
            telefono: ''
        }
    })

    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)

    const onSubmit = async (data) => {
        setError(null)
        try {
            const { error: supabaseError } = await supabase
                .from('solicitudes_acceso')
                .insert([{
                    nombre: data.nombre.trim(),
                    apellido: data.apellido.trim(),
                    email: data.email.trim(),
                    empresa: data.empresa.trim() || null,
                    telefono: data.telefono.trim() || null,
                    estado: 'pendiente'
                }])

            if (supabaseError) throw supabaseError

            setSuccess(true)
            reset()
        } catch (err) {
            console.error('Error al enviar solicitud:', err)
            setError(err.message || 'Ocurrió un error al enviar la solicitud')
        }
    }

    if (success) {
        return (
            <div className="form-container signup-form active">
                <div className="success-message">
                    <i className="fas fa-check-circle success-icon"></i>
                    <h2>¡Solicitud Enviada!</h2>
                    <p>
                        Hemos recibido tu solicitud correctamente. El administrador revisará
                        tu información y te notificará por correo electrónico cuando tu
                        acceso sea aprobado.
                    </p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            setSuccess(false)
                            onShowLogin()
                        }}
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`form-container signup-form ${activeForm === 'signup' ? 'active' : ''}`}>
            <h2>Solicitar Acceso</h2>
            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{error}</p>
                </div>
            )}

            <form className="rhf-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-group">
                    <i className="fas fa-user"></i>
                    <input
                        {...register('nombre', {
                            required: 'El nombre es obligatorio',
                            minLength: {
                                value: 2,
                                message: 'Mínimo 2 caracteres'
                            }
                        })}
                        type="text"
                        placeholder="Nombre"
                        className={errors.nombre ? 'error' : ''}
                    />
                    {errors.nombre && (
                        <span className="input-error">{errors.nombre.message}</span>
                    )}
                </div>

                <div className="input-group">
                    <i className="fas fa-user"></i>
                    <input
                        {...register('apellido', {
                            required: 'El apellido es obligatorio',
                            minLength: {
                                value: 2,
                                message: 'Mínimo 2 caracteres'
                            }
                        })}
                        type="text"
                        placeholder="Apellido"
                        className={errors.apellido ? 'error' : ''}
                    />
                    {errors.apellido && (
                        <span className="input-error">{errors.apellido.message}</span>
                    )}
                </div>

                <div className="input-group">
                    <i className="fas fa-envelope"></i>
                    <input
                        {...register('email', {
                            required: 'El email es obligatorio',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Email inválido'
                            }
                        })}
                        type="email"
                        placeholder="Correo electrónico"
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && (
                        <span className="input-error">{errors.email.message}</span>
                    )}
                </div>

                <div className="input-group">
                    <i className="fas fa-briefcase"></i>
                    <input
                        {...register('empresa')}
                        type="text"
                        placeholder="Empresa (opcional)"
                    />
                </div>

                <div className="input-group">
                    <i className="fas fa-phone"></i>
                    <input
                        {...register('telefono', {
                            pattern: {
                                value: /^[0-9+\s()-]*$/,
                                message: 'Teléfono inválido'
                            }
                        })}
                        type="tel"
                        placeholder="Teléfono (opcional)"
                        className={errors.telefono ? 'error' : ''}
                    />
                    {errors.telefono && (
                        <span className="input-error">{errors.telefono.message}</span>
                    )}
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Enviando...
                        </>
                    ) : (
                        'Enviar solicitud'
                    )}
                </button>

                <p className="notice">
                    <i className="fas fa-info-circle"></i> El administrador revisará tu
                    solicitud y te notificará por correo cuando tu acceso sea aprobado.
                </p>
            </form>

            <p className="switch-form">
                ¿Ya tienes cuenta?{' '}
                <button
                    type="button"
                    className="btn-link"
                    onClick={onShowLogin}
                >
                    Iniciar sesión
                </button>
            </p>
        </div>
    )
}