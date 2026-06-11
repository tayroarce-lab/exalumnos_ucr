import React from 'react';
import { getFullCvData, getOrCreateCvProfile } from '@/app/actions/cv/profile.actions';
import { CVStepper } from '@/components/cv/CVStepper';

export const metadata = {
  title: 'Mi Curriculum Vitae | Fundación Exalumnos UCR',
  description: 'Editor de CV optimizado para ATS',
};

export default async function CVPage() {
  // Asegurarnos de que el perfil exista
  await getOrCreateCvProfile();

  // Obtener los datos estructurados
  const cvResponse = await getFullCvData();

  if (!cvResponse.success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-semibold mb-2">Error cargando perfil</h2>
        <p>{cvResponse.message}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0B0F19] overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
      </div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-l from-blue-500 to-cyan-400 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="relative z-10">
        <CVStepper initialData={cvResponse.data} />
      </div>
    </div>
  );
}
