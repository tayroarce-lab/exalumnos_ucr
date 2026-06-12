import type { Metadata } from 'next'
import { ProfileProvider } from '@/contexts/ProfileContext'
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay'
import { Barlow_Semi_Condensed, Work_Sans } from 'next/font/google'
import './globals.css'
import '../styles/layout.css'

const barlow = Barlow_Semi_Condensed({
  subsets: ['latin'],
  weight: ['600', '900'],
  variable: '--font-barlow',
})

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-work-sans',
})

export const metadata: Metadata = {
  title: 'Fundación Exalumnos UCR',
  description: 'Directorio Estudiantil',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

<<<<<<< HEAD
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay'
=======
>>>>>>> f07c5f75fa81f7dade9d6fd27df218e3d56e9ca8

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <GlobalLoadingOverlay />
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  )
}
