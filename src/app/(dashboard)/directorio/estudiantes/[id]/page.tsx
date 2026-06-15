import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEstudianteById, getEstudiantesRelacionados } from '@/lib/api';
import StudentProfile from '../_components/StudentProfile';

export default async function PerfilEstudiantePage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const estudiante = await getEstudianteById(resolvedParams.id);

  if (!estudiante) {
    notFound();
  }

  // Estudiantes relacionados por carrera (único campo confiable disponible en la BD)
  const estudiantesRelacionados = await getEstudiantesRelacionados(
    estudiante.user_id,
    estudiante.carrera || null
  );



  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-0">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/directorio/estudiantes"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver al Directorio
          </Link>
        </div>

        <StudentProfile
          estudiante={estudiante}
          estudiantesRelacionados={estudiantesRelacionados}
        />
      </div>
    </div>
  );
}
