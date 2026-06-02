import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout estructural para páginas de autenticación (Login, Registro).
 * Muestra un enlace rápido de regreso al Home y centra el contenido en la pantalla.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="p-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="text-sm font-semibold text-blue-600 hover:text-blue-500">
          &larr; Regresar al inicio
        </Link>
      </div>
      <main className="flex flex-grow items-center justify-center">{children}</main>
    </div>
  );
}
