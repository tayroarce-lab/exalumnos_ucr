import type { Metadata } from 'next'
import { ProfileProvider } from '@/contexts/ProfileContext'
import './globals.css'
import '../styles/layout.css'

export const metadata: Metadata = {
  title: 'Fundación Exalumnos UCR',
  description: 'Directorio Estudiantil',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  )
}
