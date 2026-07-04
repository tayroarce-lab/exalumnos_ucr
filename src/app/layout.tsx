import type { Metadata } from 'next'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { CatalogsProvider } from '@/contexts/CatalogsContext'
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay'
import { Barlow_Semi_Condensed, Work_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import '../styles/layout.css'
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
    <html lang="es" className={`${barlow.variable} ${workSans.variable}`}>
      <body>
        <GlobalLoadingOverlay />
        <A11yToolbar />
        <Toaster
          position="bottom-right"
          richColors
          duration={4000}
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'var(--font-work-sans, sans-serif)',
              fontSize: '14px',
              borderRadius: '12px',
            },
          }}
        />
        <CatalogsProvider>
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </CatalogsProvider>
      </body>
    </html>
  )
}
