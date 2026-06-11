import React from 'react';
import { getFullCvData, getOrCreateCvProfile } from '@/app/actions/cv/profile.actions';
import { CVStepper } from '@/components/cv/CVStepper';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const metadata = {
  title: 'Mi Curriculum Vitae | Fundación Exalumnos UCR',
  description: 'Editor de CV optimizado para ATS',
};

export default async function CVPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 py-8">
      <CVStepper initialData={cvResponse.data} />
    </div>
  );
}
