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

import { ProfileProvider } from '@/contexts/ProfileContext'

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
