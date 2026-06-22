import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEstudianteById, getEstudiantesRelacionados } from '@/lib/api';
import StudentProfile from '../_components/StudentProfile';
import DirectoryBackground from '@/components/ui/DirectoryBackground';

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
    <div className="min-h-screen relative bg-[#FAF9E6] py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 overflow-hidden">
      {/* Fondo alegre decorado */}
      <DirectoryBackground />

      <div className="max-w-xl mx-auto space-y-0 relative z-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/directorio/estudiantes"
            className="inline-flex items-center text-sm font-bold text-[#1F8BB6] hover:text-[#003B4F] transition-colors"
          >
            ← Volver a Directorio
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
