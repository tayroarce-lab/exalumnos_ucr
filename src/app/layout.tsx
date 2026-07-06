import type { Metadata } from 'next'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { CatalogsProvider } from '@/contexts/CatalogsContext'
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay'
import { Toaster } from 'sonner'
import './globals.css'
import '../styles/layout.css'
import A11yToolbar from '@/components/A11yToolbar'

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
        <Toaster
          position="bottom-right"
          richColors
          duration={4000}
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '9999px',
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
