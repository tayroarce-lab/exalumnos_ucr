import type { Metadata } from 'next'
import './globals.css'
import '../styles/layout.css'

export const metadata: Metadata = {
  title: 'Fundación Exalumnos UCR',
  description: 'Plataforma digital para conectar graduados con estudiantes de la Universidad de Costa Rica.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <link rel="icon" href="/images/Logo_UCR.png" />
      <body className="bg-slate-50 text-brand-dark min-h-screen">
        {children}
      </body>
    </html>
  )
}
