import React from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout estructural para todas las páginas privadas y de panel de administración.
 * Agrega automáticamente el encabezado y el pie de página comunes a las rutas hijas.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}
