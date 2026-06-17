import type { Metadata } from 'next'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { Barlow_Semi_Condensed, Work_Sans } from 'next/font/google'
import './globals.css'
import '../styles/layout.css'
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay'
import A11yToolbar from '@/components/A11yToolbar'

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <GlobalLoadingOverlay />
        <A11yToolbar />
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  )
}
