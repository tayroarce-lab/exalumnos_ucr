'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

/**
 * Componente del encabezado global del sitio.
 * Muestra el logo y el menú de navegación dinámico adaptado a la sesión del usuario.
 */
export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Identidad del sitio */}
        <div className="flex">
          <Link href={ROUTES.HOME} className="flex items-center text-xl font-bold text-blue-600">
            Portal Exalumnos UCR
          </Link>
        </div>

        {/* Navegación y acciones de sesión */}
        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href={ROUTES.DASHBOARD} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href={ROUTES.PROFILE} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Mi Perfil
              </Link>
              <div className="h-4 w-[1px] bg-gray-200" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Hola, {user?.firstName}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
