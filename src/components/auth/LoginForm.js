'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'

export default function LoginForm({ onShowSignup, onShowForgotPassword, activeForm }) {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm()
    const router = useRouter()

    const onSubmit = async (data) => {
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email.trim(),
                password: data.password
            })

            if (error) throw error

            // Prefetch del dashboard mientras se verifica el perfil
            router.prefetch('/dashboard')

            const { data: profile } = await supabase
                .from('perfiles_usuarios')
                .select('*')
                .eq('id', authData.user.id)
                .single()

            router.push('/dashboard')
        } catch (error) {
            alert(error.message.includes('Invalid login')
                ? 'Email o contraseña incorrectos'
                : `Error al iniciar sesión: ${error.message}`)
        }
    }

    return (
        <div className={`form-container login-form ${activeForm === 'login' ? 'active' : ''}`}>
            <h2>Iniciar Sesión</h2>
            <form className="rhf-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-group">
                    <i className="fas fa-envelope"></i>
                    <input
                        {...register('email', { required: true })}
                        type="email"
                        placeholder="Correo electrónico"
                    />
                </div>
                <div className="input-group">
                    <i className="fas fa-lock"></i>
                    <input
                        {...register('password', { required: true })}
                        type="password"
                        placeholder="Contraseña"
                    />
                </div>
                <div className="options">
                    <label>
                        <input
                            {...register('rememberMe')}
                            type="checkbox"
                        /> Recordarme
                    </label>
                    <button
                        type="button"
                        className="btn-link forgot-password"
                        onClick={onShowForgotPassword}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>

                    {isSubmitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Verificando...
                        </>
                    ) : (
                        'Acceder'
                    )}
                </button>
            </form>
            <p className="switch-form">
                ¿No tienes cuenta?{' '}
                <button type="button" className="btn-link" onClick={onShowSignup}>
                    Solicitar acceso
                </button>
            </p>
        </div>
    )
}