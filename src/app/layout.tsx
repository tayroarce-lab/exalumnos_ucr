import type { Metadata } from 'next'
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
    <html lang="es" className={`${barlow.variable} ${workSans.variable}`}>
      <body className="font-sans antialiased text-negro-base bg-blanco">
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  )
}
