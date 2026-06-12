'use client';

// =============================================================================
// COMPONENTE: ExtendedMatches
// Descripción : Vista interactiva para el feed de Posiciones Recomendadas
//               para estudiantes. Muestra un grid de tarjetas de vacantes
//               calculadas vía "Matching Extendido" por el backend.
// =============================================================================

import { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, Tag, Activity, ArrowRight, Zap } from 'lucide-react';
import { obtenerPosicionesCompatibles, PosicionRecomendada } from '@/services/extendedMatchingService';

// [VERDE - FUNCION: getColorScorePosition]
// Genera colores vibrantes basados en el nivel de compatibilidad (score).
const getColorScorePosition = (score: number) => {
  if (score >= 80) return 'from-emerald-500 to-teal-600 bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (score >= 60) return 'from-blue-500 to-indigo-600 bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (score > 30) return 'from-amber-500 to-orange-600 bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'from-slate-500 to-slate-600 bg-slate-500/10 text-slate-400 border-slate-500/20'; // <30 pts son excluidos, pero es buen fallback
};

// =============================================================================
// [VERDE - FUNCION: ExtendedMatches]
// Componente principal. Fetching en cliente, renderizado en grid y manejo
// puro de eventos onClick.
// =============================================================================
export default function ExtendedMatches() {
  const [posiciones, setPosiciones] = useState<PosicionRecomendada[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchRecomendaciones = async () => {
      const data = await obtenerPosicionesCompatibles();
      setPosiciones(data);
      setCargando(false);
    };
    fetchRecomendaciones();
  }, []);

  // [VERDE - FUNCION: manejarAplicacionClick]
  const manejarAplicacionClick = (id: string) => {
    // Aquí se conectaría la apertura del modal "ModalAplicar" desarrollado en RF-08
    alert(`Se abrirá el modal para aplicar a la posición: ${id}`);
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Activity className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-medium">Buscando las mejores oportunidades para tu perfil...</p>
      </div>
    );
  }

  if (posiciones.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 md:p-14 flex flex-col items-center justify-center text-center shadow-lg my-8">
        <div className="w-20 h-20 bg-slate-800/80 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 border border-slate-700">
          <Zap className="w-10 h-10 text-amber-500/80" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No hay recomendaciones en este momento</h3>
        <p className="text-slate-400 max-w-lg leading-relaxed mb-8 text-sm md:text-base">
          El algoritmo de Matching Extendido no ha encontrado posiciones abiertas que superen un 30% de compatibilidad con tu perfil actual. 
          Te sugerimos expandir tus áreas de interés o revisar si hay nuevas posiciones publicadas.
        </p>
        <button 
          onClick={() => window.location.href = '/jobs'}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
        >
          Explorar Bolsa de Empleo Manualmente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Visual */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight">Posiciones Recomendadas</h2>
          <p className="text-slate-400 text-sm">Oportunidades que mejor se ajustan a tu perfil UCR</p>
        </div>
      </div>

      {/* Grid de Tarjetas de Posición */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {posiciones.map((pos) => {
          const styleScore = getColorScorePosition(pos.score_match);
          
          return (
            <article 
              key={pos.posicion_id} 
              className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Resplandor superior según match */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${styleScore.split(' ')[0]} opacity-50 group-hover:opacity-100 transition-opacity`} />
              
              <div className="p-5 flex flex-col flex-1">
                
                {/* Cabecera Tarjeta: Empresa y Score */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                      {pos.empresa}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs">
                      {pos.tipo_posicion && (
                        <span className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-full capitalize">
                          <Briefcase className="w-3.5 h-3.5" />
                          {pos.tipo_posicion}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Badge de Score visual */}
                  <div className={`flex flex-col items-center justify-center w-14 h-14 shrink-0 rounded-2xl border ${styleScore} shadow-inner`}>
                    <span className="text-lg font-black leading-none">{pos.score_match}%</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider opacity-80 mt-0.5">Match</span>
                  </div>
                </div>

                {/* Detalles de la Posición */}
                <div className="space-y-3 mb-5">
                  <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                    {pos.descripcion_general}
                  </p>
                  
                  <div className="space-y-2">
                    {pos.carrera_requerida && (
                      <div className="flex items-start gap-2 text-xs text-slate-400">
                        <Building className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong className="text-slate-300">Carrera:</strong> {pos.carrera_requerida}</span>
                      </div>
                    )}
                    {pos.sede_requerida && (
                      <div className="flex items-start gap-2 text-xs text-slate-400">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong className="text-slate-300">Sede:</strong> {pos.sede_requerida}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Áreas / Sectores */}
                <div className="mt-auto pt-4 border-t border-slate-800/50">
                  <div className="flex flex-wrap gap-1.5">
                    {pos.sector.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-slate-800/80 text-slate-300 rounded-md">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {tag}
                      </span>
                    ))}
                    {pos.sector.length > 3 && (
                      <span className="text-[11px] font-medium px-2 py-1 bg-slate-800/50 text-slate-500 rounded-md">
                        +{pos.sector.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Acción Puro (sin Form) */}
              <button 
                onClick={() => manejarAplicacionClick(pos.posicion_id)}
                className="w-full py-3.5 bg-slate-800/50 hover:bg-blue-600 group/btn text-sm font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Ver detalles y aplicar
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover/btn:text-white transition-colors group-hover/btn:translate-x-1" />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
