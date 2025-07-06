// app/layout.js (layout raíz)
import '../styles/main.scss'
import AuthWrapper from '@/components/layout/AuthWrapper'

export const metadata = {
  title: 'StockSolution',
  description: 'Controla tu inventario de manera inteligente',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/fontawesome.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/solid.min.css"
        />
        <link
          rel="preload"
          href="/fonts/principal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  )
}