'use client';

// =============================================================================
// COMPONENTE: TarjetaEstudiante
// Descripción : Tarjeta pública de proyecto estudiantil. Muestra únicamente
//               información académica y de proyecto. GUARDRAIL DE PRIVACIDAD:
//               Prohibido incluir, recibir en props o mostrar nivelBeca,
//               promedio académico o situación socioeconómica.
// =============================================================================

import { BookOpen, MapPin, Tag, Handshake } from 'lucide-react';

// ⚠️ TIPO PÚBLICO — Ausencia de beca/promedio/socioeconómico es intencional y obligatoria
export interface EstudiantePublico {
  id: string;
  nombreCompleto: string;
  carrera: string;
  sede: string;
  fotoPerfil?: string;
  proyecto: {
    titulo: string;
    areaTematica: string;
    tipoProyecto: string;
    porcentajeAvance: number; // 0-100
  };
  areasInteres: string[];
  tiposApoyoBuscado: string[];
}

interface PropsTarjetaEstudiante {
  estudiante: EstudiantePublico;
  alOfrecerApoyo: (id: string) => void;
}

// Paleta rotativa para chips de áreas de interés
const PALETA_INTERES = [
  'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'bg-amber-500/15 text-amber-300 border-amber-500/30',
];

// [VERDE - FUNCION: obtenerClaseAnchoBarra]
// Convierte un porcentaje a su clase Tailwind equivalente.
// Las clases están listadas como literales para que el JIT las incluya en el build.
function obtenerClaseAnchoBarra(porcentaje: number): string {
  const mapa: Record<number, string> = {
    0: 'w-0',        5: 'w-[5%]',   10: 'w-[10%]',
    15: 'w-[15%]',  20: 'w-[20%]',  25: 'w-1/4',
    30: 'w-[30%]',  35: 'w-[35%]',  40: 'w-2/5',
    45: 'w-[45%]',  50: 'w-1/2',    55: 'w-[55%]',
    60: 'w-[60%]',  65: 'w-[65%]',  70: 'w-[70%]',
    75: 'w-3/4',    80: 'w-4/5',    85: 'w-[85%]',
    90: 'w-[90%]',  95: 'w-[95%]', 100: 'w-full',
  };
  const redondeado = Math.round(porcentaje / 5) * 5;
  return mapa[Math.min(100, Math.max(0, redondeado))] ?? 'w-0';
}

// [VERDE - FUNCION: TarjetaEstudiante]
// Componente de presentación pública del perfil de proyecto de un estudiante UCR.
export function TarjetaEstudiante({ estudiante, alOfrecerApoyo }: PropsTarjetaEstudiante) {
  const { nombreCompleto, carrera, sede, fotoPerfil, proyecto, areasInteres, tiposApoyoBuscado } = estudiante;
  const { titulo, areaTematica, tipoProyecto, porcentajeAvance } = proyecto;

  // Iniciales para el avatar fallback cuando no hay foto de perfil
  const iniciales = nombreCompleto.split(' ').slice(0, 2).map(n => n[0]).join('');

  // Color de la barra de progreso según nivel de avance del proyecto
  const colorBarra =
    porcentajeAvance >= 75 ? 'bg-emerald-400' :
    porcentajeAvance >= 45 ? 'bg-blue-400' :
    'bg-amber-400';

  const anchoBarra = obtenerClaseAnchoBarra(porcentajeAvance);

  return (
    <article className="group relative flex flex-col bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/50 rounded-2xl p-5 gap-4 shadow-lg hover:shadow-blue-900/25 hover:border-slate-600/70 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">

      {/* Brillo de fondo al hacer hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* ── CABECERA: Avatar + Nombre + Carrera + Sede ── */}
      <div className="flex items-start gap-3 relative">
        <div className="relative flex-shrink-0">
          {fotoPerfil ? (
            <img
              src={fotoPerfil}
              alt={`Foto de ${nombreCompleto}`}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center ring-2 ring-slate-600 flex-shrink-0">
              <span className="text-white text-sm font-bold tracking-wide">{iniciales}</span>
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-800 rounded-full" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight truncate">{nombreCompleto}</h3>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{carrera}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="text-slate-500 text-xs truncate">{sede}</span>
          </div>
        </div>

        <span className="flex-shrink-0 text-xs bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/50 whitespace-nowrap">
          {tipoProyecto}
        </span>
      </div>

      {/* ── PROYECTO ── */}
      <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-700/40 relative">
        <div className="flex items-center gap-1.5 mb-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="text-blue-400 text-xs font-medium uppercase tracking-wider">Proyecto</span>
        </div>
        <p className="text-white text-sm font-medium leading-snug line-clamp-2">{titulo}</p>
        <span className="inline-block mt-1.5 text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full border border-slate-600/40">
          {areaTematica}
        </span>
      </div>

      {/* ── BARRA DE PROGRESO ANIMADA ── */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400 font-medium">Avance del proyecto</span>
          <span className="text-xs font-bold text-white">{porcentajeAvance}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full ${colorBarra} ${anchoBarra} rounded-full transition-all duration-700 ease-out`} />
        </div>
      </div>

      {/* ── ÁREAS DE INTERÉS (chips) ── */}
      {areasInteres.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-slate-400 font-medium">Áreas de interés</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {areasInteres.slice(0, 4).map((area, idx) => (
              <span
                key={area}
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PALETA_INTERES[idx % PALETA_INTERES.length]}`}
              >
                {area}
              </span>
            ))}
            {areasInteres.length > 4 && (
              <span className="text-xs text-slate-500 px-1 py-0.5">+{areasInteres.length - 4}</span>
            )}
          </div>
        </div>
      )}

      {/* ── TIPO DE APOYO BUSCADO (chips diferenciados) ── */}
      {tiposApoyoBuscado.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Handshake className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-slate-400 font-medium">Busca apoyo en</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tiposApoyoBuscado.map(tipo => (
              <span
                key={tipo}
                className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-medium"
              >
                {tipo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── BOTÓN OFRECER APOYO ── */}
      <button
        type="button"
        id={`btn-ofrecer-apoyo-${estudiante.id}`}
        onClick={() => alOfrecerApoyo(estudiante.id)}
        className="mt-auto w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold tracking-wide hover:from-blue-500 hover:to-violet-500 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-900/20 hover:shadow-blue-700/30 relative"
      >
        Ofrecer apoyo
      </button>
    </article>
  );
}
