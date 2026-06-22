'use client';

// =============================================================================
// COMPONENTE: MisMatches
// Descripción : Vista /mis-matches que renderiza las sugerencias de matching
//               con score visual, desglose de compatibilidad y acciones rápidas.
// GUARDRAIL   : Prohibido renderizar promedio académico o nivel de beca.
// Reglas UI   : Sin <form> ni style={{}}. Eventos onClick y Tailwind CSS.
// =============================================================================

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Check, X, MessageCircle, Star, BookOpen,
  Briefcase, Tag, Handshake, ChevronDown, ChevronUp, Users, User
} from 'lucide-react';
import type { MatchSugerido, EstadoMatch } from '@/services/matchingService';
import { getAvatarUrl } from '@/lib/utils';

// ─── TIPOS LOCALES ───────────────────────────────────────────────────────────

interface PropsMisMatches {
  matchesIniciales: MatchSugerido[];
  /** Callback para que el Server Component revalide tras una acción */
  onAccionar: (matchId: string, accion: 'aceptar' | 'rechazar' | 'contactar') => Promise<void>;
}

// ─── HELPERS VISUALES ────────────────────────────────────────────────────────

// [VERDE - FUNCION: obtenerColorScore]
// Determina el color del badge de score según el rango de puntuación.
function obtenerColorScore(score: number): string {
  if (score >= 80) return 'from-emerald-400 to-teal-500';
  if (score >= 60) return 'from-blue-400 to-violet-500';
  if (score >= 40) return 'from-amber-400 to-orange-500';
  return 'from-slate-400 to-slate-500';
}

// [VERDE - FUNCION: obtenerEtiquetaEstado]
// Retorna la etiqueta y el color de chip según el estado del match.
function obtenerEtiquetaEstado(estado: EstadoMatch): { label: string; clase: string } {
  const mapa: Record<EstadoMatch, { label: string; clase: string }> = {
    sugerido:   { label: 'Sugerido',   clase: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    contactado: { label: 'Contactado', clase: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    activo:     { label: 'Activo',     clase: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    cerrado:    { label: 'Cerrado',    clase: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  };
  return mapa[estado];
}

// ─── SUB-COMPONENTE: TarjetaMatch ────────────────────────────────────────────

interface PropsTarjetaMatch {
  match: MatchSugerido;
  onAccionar: (matchId: string, accion: 'aceptar' | 'rechazar' | 'contactar') => Promise<void>;
}

// [VERDE - FUNCION: TarjetaMatch]
// Tarjeta individual de un match sugerido con score visual y acciones rápidas.
function TarjetaMatch({ match, onAccionar }: PropsTarjetaMatch) {
  const [expandido, setExpandido] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imgErrorEst, setImgErrorEst] = useState(false);
  const [imgErrorExal, setImgErrorExal] = useState(false);
  const { estudiante, exalumno, desglosePuntaje } = match;
  const etiquetaEstado = obtenerEtiquetaEstado(match.estado);
  const colorScore = obtenerColorScore(match.score_match);

  // [VERDE - FUNCION: manejarAccion]
  // Ejecuta la acción del botón (aceptar/rechazar/contactar) sin formulario.
  function manejarAccion(accion: 'aceptar' | 'rechazar' | 'contactar') {
    startTransition(async () => { await onAccionar(match.id, accion); });
  }

  // Iniciales del fallback de avatar
  const inicialesEst  = estudiante.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');
  const inicialesExal = exalumno.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <article className="group bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg hover:border-slate-600/70 hover:shadow-blue-900/20 transition-all duration-300">

      {/* ── CABECERA: Score + Perfiles + Estado ── */}
      <div className="flex items-start gap-4 p-5">

        {/* Badge circular del score */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${colorScore} flex flex-col items-center justify-center shadow-lg`}>
          <span className="text-white text-xl font-black leading-none">{match.score_match}</span>
          <span className="text-white/70 text-xs font-medium">pts</span>
        </div>

        {/* Avatares + nombres de ambos perfiles */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {/* Estudiante */}
            <div className="flex items-center gap-2 min-w-0">
              {estudiante.foto_url && !imgErrorEst ? (
                <img src={getAvatarUrl(estudiante.foto_url, estudiante.nombre) as string} alt={estudiante.nombre}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-600 flex-shrink-0"
                  onError={() => setImgErrorEst(true)} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center ring-2 ring-slate-600 flex-shrink-0">
                  <span className="text-white text-xs font-bold">{inicialesEst}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{estudiante.nombre}</p>
                <p className="text-slate-400 text-xs truncate">{estudiante.carrera}</p>
              </div>
            </div>

            {/* Separador visual */}
            <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
              <div className="w-px h-3 bg-slate-600" />
              <Handshake className="w-4 h-4 text-blue-400" />
              <div className="w-px h-3 bg-slate-600" />
            </div>

            {/* Exalumno */}
            <div className="flex items-center gap-2 min-w-0">
              {exalumno.foto_url && !imgErrorExal ? (
                <img src={getAvatarUrl(exalumno.foto_url, exalumno.nombre) as string} alt={exalumno.nombre}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-600 flex-shrink-0"
                  onError={() => setImgErrorExal(true)} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center ring-2 ring-slate-600 flex-shrink-0">
                  <span className="text-white text-xs font-bold">{inicialesExal}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{exalumno.nombre}</p>
                <p className="text-slate-400 text-xs truncate">
                  {exalumno.cargo_actual ?? exalumno.carrera_ucr}
                </p>
              </div>
            </div>
          </div>

          {/* Estado + empresa del exalumno */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${etiquetaEstado.clase}`}>
              {etiquetaEstado.label}
            </span>
            {exalumno.empresa_actual && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Briefcase className="w-3 h-3" />
                {exalumno.empresa_actual}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── DESGLOSE DE COMPATIBILIDAD ── */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-2 gap-2">

          {/* Misma carrera */}
          <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
            desglosePuntaje.mismaCarrera
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-slate-800/50 border-slate-700/40 text-slate-500'
          }`}>
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium">Misma carrera</span>
            <span className="ml-auto font-bold">{desglosePuntaje.mismaCarrera ? '+30' : '0'}</span>
          </div>

          {/* Áreas en común */}
          <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
            desglosePuntaje.areasEnComun.length > 0
              ? 'bg-blue-500/10 border-blue-500/25 text-blue-300'
              : 'bg-slate-800/50 border-slate-700/40 text-slate-500'
          }`}>
            <Tag className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium">{desglosePuntaje.areasEnComun.length} área(s) común</span>
            <span className="ml-auto font-bold">
              {desglosePuntaje.areasEnComun.length > 0 ? '+≤30' : '0'}
            </span>
          </div>

          {/* Sector ↔ Área temática */}
          <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
            desglosePuntaje.sectorCoincide
              ? 'bg-violet-500/10 border-violet-500/25 text-violet-300'
              : 'bg-slate-800/50 border-slate-700/40 text-slate-500'
          }`}>
            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium">Sector ↔ Proyecto</span>
            <span className="ml-auto font-bold">{desglosePuntaje.sectorCoincide ? '+20' : '0'}</span>
          </div>

          {/* Tipo de apoyo */}
          <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
            desglosePuntaje.apoyoCoincide
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
              : 'bg-slate-800/50 border-slate-700/40 text-slate-500'
          }`}>
            <Star className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium">Tipo de apoyo</span>
            <span className="ml-auto font-bold">{desglosePuntaje.apoyoCoincide ? '+20' : '0'}</span>
          </div>
        </div>

        {/* Panel expandible: áreas en común y datos del proyecto */}
        {expandido && desglosePuntaje.areasEnComun.length > 0 && (
          <div className="mt-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <p className="text-xs text-slate-400 font-medium mb-2">Áreas de interés compartidas:</p>
            <div className="flex flex-wrap gap-1.5">
              {desglosePuntaje.areasEnComun.map(area => (
                <span key={area} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {expandido && estudiante.proyecto_titulo && (
          <div className="mt-2 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <p className="text-xs text-slate-400 font-medium mb-1">Proyecto del estudiante:</p>
            <p className="text-sm text-white font-medium leading-snug">{estudiante.proyecto_titulo}</p>
            {estudiante.proyecto_area_tematica && (
              <span className="inline-block mt-1 text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                {estudiante.proyecto_area_tematica}
              </span>
            )}
          </div>
        )}

        {/* Toggle expandir/colapsar */}
        <button
          type="button"
          onClick={() => setExpandido(prev => !prev)}
          className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150"
        >
          {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expandido ? 'Ver menos' : 'Ver más detalles'}
        </button>
      </div>

      {/* ── ACCIONES RÁPIDAS ── */}
      {match.estado === 'sugerido' && (
        <div className="flex gap-2 px-5 pb-5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => manejarAccion('rechazar')}
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-medium hover:bg-red-500/20 hover:border-red-500/40 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Rechazar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => manejarAccion('contactar')}
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:border-slate-600 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4" />
            Contactar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => manejarAccion('aceptar')}
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all duration-150 shadow-md shadow-emerald-900/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Aceptar
          </button>
        </div>
      )}

      {match.estado === 'contactado' && (
        <div className="px-5 pb-5">
          <Link
            href={`/network/${match.estudiante.id}`}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm font-medium hover:bg-amber-500/20 active:scale-[0.98] transition-all duration-150"
          >
            <User className="w-4 h-4" />
            Ver información
          </Link>
        </div>
      )}
    </article>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

// [VERDE - FUNCION: MisMatches]
// Vista principal /mis-matches que lista y gestiona las sugerencias del algoritmo.
export default function MisMatches({ matchesIniciales, onAccionar }: PropsMisMatches) {
  const [matches, setMatches] = useState<MatchSugerido[]>(matchesIniciales);
  const [filtroEstado, setFiltroEstado] = useState<EstadoMatch | 'todos'>('todos');

  // Filtra los matches según el estado seleccionado
  const matchesFiltrados = filtroEstado === 'todos'
    ? matches
    : matches.filter(m => m.estado === filtroEstado);

  // Estadísticas rápidas para el encabezado
  const totalActivos    = matches.filter(m => m.estado === 'activo').length;
  const totalSugeridos  = matches.filter(m => m.estado === 'sugerido').length;
  const scorePromedio   = matches.length > 0
    ? Math.round(matches.reduce((acc, m) => acc + m.score_match, 0) / matches.length)
    : 0;

  const ESTADOS_FILTRO: Array<{ valor: EstadoMatch | 'todos'; label: string }> = [
    { valor: 'todos',      label: 'Todos' },
    { valor: 'sugerido',   label: 'Sugeridos' },
    { valor: 'contactado', label: 'Contactados' },
    { valor: 'activo',     label: 'Activos' },
    { valor: 'cerrado',    label: 'Cerrados' },
  ];

  // [VERDE - FUNCION: manejarAccionMatch]
  // Delegación de acciones al callback del padre + actualización local de estado.
  async function manejarAccionMatch(
    matchId: string,
    accion: 'aceptar' | 'rechazar' | 'contactar'
  ) {
    await onAccionar(matchId, accion);
    // Actualización optimista del estado local
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      if (accion === 'rechazar') return { ...m, estado: 'cerrado' };
      if (accion === 'aceptar')  return { ...m, estado: 'contactado' };
      return m;
    }));
  }

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── ENCABEZADO ── */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Mis Matches</h1>
              <p className="text-slate-500 text-xs">Sugerencias del sistema de compatibilidad</p>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-center">
              <p className="text-white font-bold text-lg leading-none">{totalSugeridos}</p>
              <p className="text-slate-500 text-xs">Nuevos</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <p className="text-emerald-400 font-bold text-lg leading-none">{totalActivos}</p>
              <p className="text-slate-500 text-xs">Activos</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <p className="text-blue-400 font-bold text-lg leading-none">{scorePromedio}</p>
              <p className="text-slate-500 text-xs">Score prom.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── FILTROS DE ESTADO ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {ESTADOS_FILTRO.map(({ valor, label }) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltroEstado(valor)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                filtroEstado === valor
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              {label}
              {valor !== 'todos' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({matches.filter(m => m.estado === valor).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── LISTA DE MATCHES ── */}
        {matchesFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {matchesFiltrados.map(match => (
              <TarjetaMatch
                key={match.id}
                match={match}
                onAccionar={manejarAccionMatch}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-900/40 border border-slate-800/60 rounded-3xl mt-4">
            <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-lg shadow-black/20">
              <Users className="w-10 h-10 text-emerald-500/80" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-xl font-bold text-white mb-2">Sin matches en este estado</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {filtroEstado === 'todos'
                  ? 'El sistema aún no ha generado sugerencias para tu perfil. Intenta actualizar tus áreas de interés.'
                  : `Actualmente no tienes ningún match en estado "${filtroEstado}".`}
              </p>
            </div>
            {filtroEstado !== 'todos' && (
              <button
                type="button"
                onClick={() => setFiltroEstado('todos')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-2"
              >
                Ver todos los matches
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
