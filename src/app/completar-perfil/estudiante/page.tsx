import React from 'react';
import StudentOnboardingForm from '@/components/forms/StudentOnboardingForm';

export const metadata = {
  title: 'Completar Perfil | Estudiante',
  description: 'Completa tu perfil de estudiante en la plataforma Alumni UCR',
};

export default function EstudianteOnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Completar Perfil de Estudiante
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Cuéntanos más sobre ti y tu proyecto para conectarte con los mentores y recursos adecuados.
          </p>
        </div>
        
        <StudentOnboardingForm />
      </div>
    </div>
  );
}
