import React from 'react';
import ExalumnoOnboardingForm from '@/components/forms/ExalumnoOnboardingForm';
import AuthBackground from '@/components/ui/AuthBackground';
import { Sparkles, Briefcase } from 'lucide-react';
import '@/styles/registerStyles.css';
import '@/styles/cycleWisdom.css';

export const metadata = {
  title: 'Completar Perfil | Exalumno',
  description: 'Completa tu perfil de exalumno en la plataforma Alumni UCR',
};

export default function ExalumnoOnboardingPage() {
  return (
    <div className="register-page-wrapper bg-gray-50 relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
      <AuthBackground />
      <div className="relative z-10 max-w-3xl w-full space-y-8">
        
        {/* Header decorativo */}
        <div className="text-center space-y-3 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-naranja/30 text-naranja mb-2 animate-bounce-slow">
            <Briefcase className="w-10 h-10" />
          </div>
          <div className="flex items-center justify-center gap-2 text-naranja text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-naranja animate-pulse" />
            <span>Paso Inicial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display uppercase">
            Completar Perfil de Exalumno
          </h1>
          <p className="max-w-md mx-auto text-sm text-slate-700 font-semibold leading-relaxed">
            Cuéntanos sobre tu trayectoria profesional, áreas de interés y cómo te gustaría apoyar y conectar con la próxima generación de graduados de la red Alumni UCR.
          </p>
        </div>
        
        {/* Contenedor del Formulario con efecto de vidrio flotante */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 relative z-20">
          <ExalumnoOnboardingForm />
        </div>
        
      </div>
    </div>
  );
}
