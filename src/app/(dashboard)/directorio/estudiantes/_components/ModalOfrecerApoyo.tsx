'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, Users, Briefcase, GraduationCap, Lock } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

// ============================================================
// Tipos de apoyo disponibles en el modal
// ============================================================
interface TipoApoyoOpcion {
  id: string;
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
  color: string;
  bgColor: string;
  borderColor: string;
  disponible: boolean;
}

interface PropModalOfrecerApoyo {
  /** Nombre completo del estudiante */
  nombreEstudiante: string;
  /** user_id del estudiante en Supabase */
  estudianteId: string;
  /** Título del proyecto del estudiante */
  tituloProyecto?: string | null;
  /** Tipos de apoyo que el estudiante busca */
  tiposApoyoBuscado: {
    buscaFinanciamiento: boolean;
    buscaMentoria: boolean;
    buscaEmpleo: boolean;
    buscaPasantia: boolean;
  };
  /** Callback para cerrar el modal */
  onClose: () => void;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ModalOfrecerApoyo({
  nombreEstudiante,
  estudianteId,
  tituloProyecto,
  tiposApoyoBuscado,
  onClose,
}: PropModalOfrecerApoyo) {
  const router = useRouter();

  useLockBodyScroll(true);

  // Construir opciones dinámicas según lo que el estudiante busca
  const OPCIONES: TipoApoyoOpcion[] = [
    {
      id: 'donacion',
      icono: <Heart className="w-6 h-6" />,
      titulo: 'Donación económica',
      descripcion: 'Apoya financieramente el proyecto. Realiza una transferencia por SINPE o IBAN y sube el comprobante.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200 hover:border-[#F34B26]',
      disponible: tiposApoyoBuscado.buscaFinanciamiento,
    },
    {
      id: 'mentoria',
      icono: <GraduationCap className="w-6 h-6" />,
      titulo: 'Mentoría profesional',
      descripcion: 'Comparte tu experiencia y guía al estudiante en su desarrollo académico y profesional.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200 hover:border-blue-500',
      disponible: tiposApoyoBuscado.buscaMentoria,
    },
    {
      id: 'empleo',
      icono: <Briefcase className="w-6 h-6" />,
      titulo: 'Oferta de empleo',
      descripcion: 'Conecta al estudiante con oportunidades laborales en tu empresa o red de contactos.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200 hover:border-emerald-500',
      disponible: tiposApoyoBuscado.buscaEmpleo,
    },
    {
      id: 'pasantia',
      icono: <Users className="w-6 h-6" />,
      titulo: 'Pasantía',
      descripcion: 'Ofrece una pasantía para que el estudiante adquiera experiencia práctica en tu área.',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200 hover:border-violet-500',
      disponible: tiposApoyoBuscado.buscaPasantia,
    },
  ];

  const handleSeleccion = (tipoId: string) => {
    onClose();

    const nombreEnc = encodeURIComponent(nombreEstudiante);
    const proyectoEnc = encodeURIComponent(tituloProyecto || '');

    switch (tipoId) {
      case 'donacion':
        router.push(`/donations?proyecto_id=${estudianteId}`);
        break;
      case 'mentoria':
      case 'empleo':
      case 'pasantia':
        // Redirige al flujo de matches existente con el tipo de apoyo preseleccionado
        router.push(
          `/mis-matches?nuevo=${estudianteId}&tipo=${tipoId}&nombre=${nombreEnc}`
        );
        break;
    }
  };

  return (
    // Overlay
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Wrapper centrado */}
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Panel del modal */}
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#003B4F] to-[#1A5B75] px-6 py-5">
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
            Ofrecer apoyo a
          </p>
          <h2 className="text-white font-black text-xl leading-tight">
            {nombreEstudiante}
          </h2>
          {tituloProyecto && (
            <p className="text-white/60 text-xs font-medium mt-1 line-clamp-1">
              📘 {tituloProyecto}
            </p>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Selecciona cómo deseas apoyar
          </p>

          {OPCIONES.map((opcion) => {
            const isDisabled = !opcion.disponible;

            return (
              <button
                key={opcion.id}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && handleSeleccion(opcion.id)}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isDisabled
                    ? 'cursor-not-allowed bg-slate-50 border-slate-200 opacity-60'
                    : `group ${opcion.borderColor} bg-white hover:shadow-md active:scale-[0.98]`
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                    isDisabled
                      ? 'bg-slate-100 text-slate-400'
                      : `${opcion.bgColor} ${opcion.color} group-hover:scale-110`
                  }`}
                >
                  {opcion.icono}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm leading-tight ${isDisabled ? 'text-slate-500' : 'text-slate-800'}`}>
                    {opcion.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    {opcion.descripcion}
                  </p>
                  {isDisabled && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      No solicitado actualmente
                    </span>
                  )}
                </div>
                {isDisabled ? (
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                ) : (
                  <svg
                    className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1 group-hover:text-slate-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
            Al continuar, aceptas los{' '}
            <a href="/aviso-legal" className="underline hover:text-slate-600 transition-colors">
              términos de uso
            </a>{' '}
            de la Fundación Exalumnos UCR.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
