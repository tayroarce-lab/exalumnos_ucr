import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEstudianteById, getEstudiantesRelacionados } from '@/lib/api';
import StudentProfile from '../_components/StudentProfile';

export default async function PerfilEstudiantePage({ params }: { params: { id: string } }) {
  const estudiante = await getEstudianteById(params.id);

  if (!estudiante) {
    notFound();
  }

  const estudiantesRelacionados = await getEstudiantesRelacionados(
    estudiante.user_id,
    estudiante.proyecto_area_tematica
  );

  const tagsApoyo = (() => {
    const tags: string[] = [];
    if (estudiante.busca_financiamiento) tags.push('Financiamiento');
    if (estudiante.busca_mentoria) tags.push('Mentoría');
    if (estudiante.busca_empleo) tags.push('Empleo');
    if (estudiante.busca_pasantia) tags.push('Pasantía');
    return tags;
  })();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <Link href="/directorio/estudiantes" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-esmeralda transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver al Directorio
          </Link>
        </div>
        <StudentProfile estudiante={estudiante} tagsApoyo={tagsApoyo} estudiantesRelacionados={estudiantesRelacionados} />
      </div>
    </div>
  );
}
