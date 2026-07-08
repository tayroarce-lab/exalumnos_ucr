import React from 'react';
import StudentOnboardingForm from '@/components/forms/StudentOnboardingForm';
import AuthBackground from '@/components/ui/AuthBackground';
import { Sparkles, UserCircle } from 'lucide-react';
import '@/styles/registerStyles.css';
import '@/styles/cycleWisdom.css';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Completar Perfil | Estudiante',
  description: 'Completa tu perfil de estudiante en la plataforma Alumni UCR',
};

export default async function EstudianteOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userName = 'No disponible';
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('full_name, nombre, apellidos').eq('id', user.id).single();
    if (profile && profile.full_name) {
      userName = profile.full_name;
    } else if (profile && profile.nombre) {
      userName = `${profile.nombre} ${profile.apellidos || ''}`.trim();
    } else if (user.user_metadata?.nombre) {
      userName = user.user_metadata.nombre;
    }
  }

  return (
    <div className="register-page-wrapper bg-gray-50 relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
      <AuthBackground />
      <div className="relative z-10 max-w-3xl w-full space-y-8">
        
        {/* Header decorativo */}
        <div className="text-center space-y-3 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-celeste/30 text-celeste mb-2 animate-bounce-slow">
            <UserCircle className="w-10 h-10" />
          </div>
          <div className="flex items-center justify-center gap-2 text-celeste text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-celeste animate-pulse" />
            <span>Paso Inicial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display uppercase">
            Completar Perfil de Estudiante
          </h1>
          <p className="max-w-md mx-auto text-sm text-slate-700 font-semibold leading-relaxed">
            Cuéntanos más sobre ti, tus intereses y proyecto de graduación para conectarte con mentores y recursos adecuados de la red Alumni UCR.
          </p>
        </div>
        
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 relative z-20">
          <StudentOnboardingForm userName={userName} userEmail={user?.email || 'No disponible'} />
        </div>
        
      </div>
    </div>
  );
}
