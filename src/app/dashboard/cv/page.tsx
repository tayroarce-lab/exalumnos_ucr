import React from 'react';
import { getFullCvData, getOrCreateCvProfile } from '@/app/actions/cv/profile.actions';
import { CVStepper } from '@/components/cv/CVStepper';
import { CVLiveProvider } from '@/components/cv/CVLiveContext';

export const metadata = {
  title: 'Mi Curriculum Vitae | Fundación Exalumnos UCR',
  description: 'Editor de CV optimizado para ATS',
};

export default async function CVPage() {
  // Asegurarnos de que el perfil exista
  await getOrCreateCvProfile();

  // Obtener los datos estructurados
  const cvResponse = await getFullCvData();

  if (!cvResponse.success || !cvResponse.data) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-semibold mb-2">Error cargando perfil</h2>
        <p>{cvResponse.message}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#F4F7FB] overflow-hidden">
      <div className="relative z-10">
        <CVLiveProvider initialData={cvResponse.data}>
          <CVStepper initialData={cvResponse.data} />
        </CVLiveProvider>
      </div>
    </div>
  );
}
