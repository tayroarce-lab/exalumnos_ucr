'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

/**
 * Página del perfil profesional del exalumno.
 * Permite complementar la información con datos laborales y de contacto adicionales.
 */
export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [currentCompany, setCurrentCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Manejador del guardado del perfil.
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      // Simular guardado local/llamada de red
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage('El perfil se ha actualizado exitosamente.');
    } catch (error: unknown) {
      console.error('Error al guardar perfil:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Cargando información de perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra tus datos personales y añade detalles de tu carrera profesional.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {successMessage && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* Sección: Datos Personales (Lectura) */}
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900 animate-pulse-once">Datos Académicos (Fijos)</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                <div className="mt-1 text-sm text-gray-900 font-semibold">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Correo Institucional</label>
                <div className="mt-1 text-sm text-gray-900">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Sección: Información Profesional (Editable) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Información Profesional</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Empresa Actual
                </label>
                <input
                  id="company"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej. Google, Intel, UCR"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                  Cargo / Puesto
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej. Ingeniero de Software, Consultor"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                Perfil de LinkedIn (URL)
              </label>
              <input
                id="linkedin"
                type="url"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="https://linkedin.com/in/usuario"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Biografía
              </label>
              <textarea
                id="bio"
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Cuéntanos un poco sobre tu trayectoria y metas profesionales..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-200 pt-4">
            <Button type="submit" isLoading={isSaving}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
