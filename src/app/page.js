// src/app/page.js
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import AboutContent from '@/components/AboutContent'
import ContactForm from '@/components/ContactForm' // Asegúrate de crear este componente

const ForgotPasswordModal = dynamic(
  () => import('@/components/auth/ForgotPasswordModal'),
  {
    ssr: false,
    loading: () => <p>Cargando formulario de recuperación...</p>
  }
)

export default function HomePage() {
  const [activeForm, setActiveForm] = useState('login')
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [activeSection, setActiveSection] = useState('home') // 'home', 'about', 'contact'
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'about':
        return <AboutContent />
      case 'contact':
        return <ContactForm />
      case 'home':
      default:
        return (
          <div className="auth-forms" style={{ position: 'relative' }}>
            {activeForm === 'login' ? (
              <LoginForm
                onShowSignup={() => setActiveForm('signup')}
                onShowForgotPassword={() => setShowForgotModal(true)}
                activeForm={activeForm}
              />
            ) : (
              <SignupForm
                onShowLogin={() => setActiveForm('login')}
                activeForm={activeForm}
              />
            )}
          </div>
        )
    }
  }

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <i className="fas fa-calculator"></i>
            <h1>Stock<span>Solution</span></h1>
          </div>
          <nav className="main-nav">
            <ul>
              <li>
                <a
                  href="#"
                  className={activeSection === 'home' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveSection('home')
                  }}
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={activeSection === 'about' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveSection('about')
                  }}
                >
                  Acerca de
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={activeSection === 'contact' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveSection('contact')
                  }}
                >
                  Contacto
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {activeSection === 'home' ? (
          <div className="welcome-section">
            <div className="welcome-text">
              <h2>Controla tu inventario de manera inteligente</h2>
              <p>Optimiza tus recursos, reduce pérdidas y toma decisiones basadas en datos con la calculadora de inventario.</p>
              <div className="features">
                <div className="feature">
                  <i className="fas fa-chart-line"></i>
                  <p>Análisis en tiempo real</p>
                </div>
                <div className="feature">
                  <i className="fas fa-shield-alt"></i>
                  <p>Datos protegidos</p>
                </div>
                <div className="feature">
                  <i className="fas fa-mobile-alt"></i>
                  <p>Acceso desde cualquier dispositivo</p>
                </div>
              </div>
            </div>
            {isClient && renderSection()}
          </div>
        ) : (
          <div className="content-section">
            {isClient && renderSection()}
          </div>
        )}
      </main>

      <footer className="main-footer">
        <div className="footer-bottom">
          <p>&copy; 2025 StockSolution. Todos los derechos reservados.</p>
          <div className="social-icons">
            <a href="https://www.facebook.com/HidroponiasVenezolanas"><i className="fab fa-facebook-f"></i></a>
            <a href="https://ve.linkedin.com/company/hidroponias-venezolanas-c-a"><i className="fab fa-linkedin-in"></i></a>
            <a href="https://www.instagram.com/hidroponiasvenezolanas/?hl=es"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </footer>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </>
  )
}