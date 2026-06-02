'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

/**
 * Vista del panel de administración/usuario (Dashboard).
 * Ofrece acceso rápido a funcionalidades clave (editar perfil, ver eventos, ver bolsa de empleo).
 */
export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
          Bienvenido, {user?.firstName || 'Graduado'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Este es tu portal para conectar con otros exalumnos, enterarte de eventos y ver ofertas laborales.
        </p>
      </div>

      {/* Grid de accesos rápidos */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta: Mi Perfil */}
        <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mi Perfil</h3>
            <p className="mt-2 text-sm text-gray-500">
              Mantén tu información académica y profesional al día para que otros graduados y empresas te encuentren.
            </p>
          </div>
          <div className="mt-6">
            <Link href={ROUTES.PROFILE}>
              <Button variant="outline" size="sm" className="w-full">
                Editar Información
              </Button>
            </Link>
          </div>
        </div>

        {/* Tarjeta: Eventos */}
        <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Eventos y Redes</h3>
            <p className="mt-2 text-sm text-gray-500">
              Inscríbete a webinars, ferias de empleo, congresos y reuniones organizadas por la universidad.
            </p>
          </div>
          <div className="mt-6">
            <Button variant="primary" size="sm" className="w-full">
              Explorar Eventos
            </Button>
          </div>
        </div>

        {/* Tarjeta: Oportunidades */}
        <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bolsa de Empleo</h3>
            <p className="mt-2 text-sm text-gray-500">
              Accede a convocatorias y ofertas laborales exclusivas dirigidas a profesionales egresados de la UCR.
            </p>
          </div>
          <div className="mt-6">
            <Button variant="secondary" size="sm" className="w-full">
              Buscar Trabajo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
