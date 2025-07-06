// src/components/ContactForm.js
'use client'

import { useState } from 'react'

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Aquí iría la lógica para enviar el formulario
            // Por ejemplo, usando fetch a una API route de Next.js
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                setSubmitMessage('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.')
                setFormData({ name: '', email: '', message: '' })
            } else {
                throw new Error('Error al enviar el mensaje')
            }
        } catch (error) {
            setSubmitMessage('Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="contact-form-container">
            <h2>Contáctanos</h2>
            <p>¿Tienes preguntas o comentarios? Envíanos un mensaje y te responderemos lo antes posible.</p>

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Correo electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="message">Mensaje:</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="5"
                        required
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                </button>

                {submitMessage && <p className="submit-message">{submitMessage}</p>}
            </form>
        </div>
    )
}