import type { Metadata } from 'next'
import { ProfileProvider } from '@/contexts/ProfileContext'
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
}

<<<<<<< HEAD
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay'

=======
>>>>>>> 6e204a6103b44cf8dc51ab329c5f8433c1d193c6
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