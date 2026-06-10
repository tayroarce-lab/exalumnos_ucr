import type { Metadata } from 'next'
import './globals.css'
import '../styles/layout.css'

export const metadata: Metadata = {
  title: 'Fundación Exalumnos UCR',
  description: 'Directorio Estudiantil',
  icons: {
    icon: '/images/Logo_UCR.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
