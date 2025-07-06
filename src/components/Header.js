// components/Header.js
'use client'
import Link from 'next/link'

export default function Header() {
    return (
        <header className="main-header">
            <div className="header-container">
                <div className="logo">
                    <i className="fas fa-calculator"></i>
                    <h1>Stock<span>Solution</span></h1>
                </div>
                <nav className="main-nav">
                    <ul>
                        <li><Link href="/">Inicio</Link></li>
                        <li><Link href="/about">Acerca de</Link></li>
                        <li><Link href="/contact">Contacto</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}