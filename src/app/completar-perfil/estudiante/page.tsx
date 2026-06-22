import React from 'react';
import StudentOnboardingForm from '@/components/forms/StudentOnboardingForm';
import { Sparkles, UserCircle } from 'lucide-react';

export const metadata = {
  title: 'Completar Perfil | Estudiante',
  description: 'Completa tu perfil de estudiante en la plataforma Alumni UCR',
};

export default function EstudianteOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-celeste/15 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Header decorativo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-celeste/30 text-celeste mb-2 animate-bounce-slow">
            <UserCircle className="w-10 h-10" />
          </div>
          <div className="flex items-center justify-center gap-2 text-celeste text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-celeste animate-pulse" />
            <span>Paso Inicial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight font-display uppercase">
            Completar Perfil de Estudiante
          </h1>
          <p className="max-w-md mx-auto text-sm text-slate-500 font-medium leading-relaxed">
            Cuéntanos más sobre ti, tus intereses y proyecto de graduación para conectarte con mentores y recursos adecuados de la red Alumni UCR.
          </p>
        </div>
        
        {/* Contenedor del Formulario con efecto de vidrio flotante */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <StudentOnboardingForm />
        </div>
        
      </div>
    </div>
  );
}
