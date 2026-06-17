'use client'
import { getAvatarUrl } from '@/lib/utils';

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Handshake, GraduationCap, Briefcase, MessageCircle, Check,
  X, Users, Clock, Star, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react'
import Card from '@/components/ui/card'

// ─── TIPOS ──────────────────────────────────────────────────────────────────
type EstadoMatch = 'sugerido' | 'contactado' | 'activo' | 'cerrado'

interface Estudiante {
  id: string
  nombre: string
  apellidos: string | null
  foto_url: string | null
  carrera_principal: string | null
  proyecto_titulo: string | null
}

interface MatchReal {
  id: string
  score_match: number
  estado: EstadoMatch
  areas_comunes: string[]
  created_at: string
  estudiante: Estudiante | null
}

// ─── CONFIG DE ESTADO ────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<EstadoMatch, { label: string; clase: string }> = {
  sugerido:   { label: 'Sugerido',   clase: 'bg-[#F34B26]/10 text-[#F34B26] border border-[#F34B26]/20'       },
  contactado: { label: 'Contactado', clase: 'bg-amber-500/15 text-amber-700 border border-amber-300'    },
  activo:     { label: 'Activo',     clase: 'bg-emerald-500/15 text-emerald-700 border border-emerald-300' },
  cerrado:    { label: 'Cerrado',    clase: 'bg-slate-200 text-slate-500 border border-slate-300'       },
}

function getScoreColor(score: number) {
  if (score >= 80) return 'from-emerald-500 to-teal-600'
  if (score >= 60) return 'from-[#FF9B18] to-[#F34B26]'
  if (score >= 40) return 'from-amber-500 to-orange-600'
  return 'from-slate-400 to-slate-500'
}

// ─── TARJETA DE MATCH ────────────────────────────────────────────────────────
function TarjetaMatch({ match, onAccion }: {
  match: MatchReal
  onAccion: (id: string, accion: 'aceptar' | 'rechazar' | 'contactar') => Promise<void>
}) {
  const [expandido, setExpandido] = useState(false)
  const [pendiente, setPendiente] = useState(false)
  const est = match.estudiante
  const estadoConf = ESTADO_CONFIG[match.estado]
  const nombre = est ? `${est.nombre} ${est.apellidos ?? ''}`.trim() : 'Estudiante UCR'
  const initials = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  const handleAccion = async (accion: 'aceptar' | 'rechazar' | 'contactar') => {
    setPendiente(true)
    await onAccion(match.id, accion)
    setPendiente(false)
  }

  return (
    <article className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Cabecera con score */}
      <div className="flex items-start gap-4 p-5">
        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${getScoreColor(match.score_match)} flex flex-col items-center justify-center shadow`}>
          <span className="text-white text-lg font-black leading-none">{match.score_match}</span>
          <span className="text-white/70 text-[10px] font-medium">pts</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Avatar */}
            {est?.foto_url ? (
              <img src={getAvatarUrl(est.foto_url) as string} alt={nombre} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F34B26] to-[#FF9B18] text-white text-xs font-bold flex items-center justify-center ring-2 ring-slate-100">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{nombre}</p>
              {est?.carrera_principal && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {est.carrera_principal}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoConf.clase}`}>
              {estadoConf.label}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(match.created_at).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>

      {/* Áreas en común */}
      {match.areas_comunes && match.areas_comunes.length > 0 && (
        <div className="px-5 pb-3">
          <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs bg-orange-50 border-[#F34B26]/25 text-[#F34B26]`}>
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">{match.areas_comunes.length} área(s) de interés en común</span>
          </div>

          {expandido && (
            <div className="mt-2 flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
              {match.areas_comunes.map(area => (
                <span key={area} className="text-xs px-2 py-0.5 rounded-full bg-[#FF9B18]/10 text-[#FF9B18] font-medium">{area}</span>
              ))}
            </div>
          )}

          {est?.proyecto_titulo && expandido && (
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Proyecto del estudiante</p>
              <p className="text-sm text-slate-800 font-semibold">{est.proyecto_titulo}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpandido(p => !p)}
            className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expandido ? 'Ver menos' : 'Ver detalles'}
          </button>
        </div>
      )}

      {/* Acciones */}
      {match.estado === 'sugerido' && (
        <div className="flex gap-2 px-5 pb-5">
          <button type="button" disabled={pendiente} onClick={() => handleAccion('rechazar')}
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50">
            <X className="w-4 h-4" /> Rechazar
          </button>
          <button type="button" disabled={pendiente} onClick={() => handleAccion('contactar')}
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all disabled:opacity-50">
            <MessageCircle className="w-4 h-4" /> Contactar
          </button>
          <button type="button" disabled={pendiente} onClick={() => handleAccion('aceptar')}
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow disabled:opacity-50">
            <Check className="w-4 h-4" /> Aceptar
          </button>
        </div>
      )}

      {match.estado === 'contactado' && (
        <div className="px-5 pb-5">
          <button type="button" disabled={pendiente} onClick={() => handleAccion('contactar')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-all disabled:opacity-50">
            <MessageCircle className="w-4 h-4" /> Ver conversación
          </button>
        </div>
      )}
    </article>
  )
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function MentoriasPage() {
  const [matches, setMatches] = useState<MatchReal[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState<EstadoMatch | 'todos'>('todos')
  const [error, setError] = useState<string | null>(null)

  const cargarMatches = useCallback(async () => {
    setCargando(true)
    setError(null)
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data, error: fetchError } = await supabase
        .from('matches')
        .select(`
          id,
          score_match,
          estado,
          areas_comunes,
          created_at,
          estudiante:users!matches_estudiante_id_fkey (
            id, nombre, apellidos, foto_url,
            estudiantes (
              carrera,
              proyecto_titulo
            )
          )
        `)
        .eq('exalumno_id', user.id)
        .order('score_match', { ascending: false })

      if (fetchError) throw new Error(fetchError.message)

      const mappedData = (data ?? []).map((m: any) => {
        const estObj = Array.isArray(m.estudiante) ? m.estudiante[0] : m.estudiante;
        const estData = Array.isArray(estObj?.estudiantes) ? estObj?.estudiantes[0] : estObj?.estudiantes;
        
        return {
          ...m,
          estudiante: estObj ? {
            id: estObj.id,
            nombre: estObj.nombre,
            apellidos: estObj.apellidos,
            foto_url: estObj.foto_url,
            carrera_principal: estData?.carrera ?? null,
            proyecto_titulo: estData?.proyecto_titulo ?? null,
          } : null
        }
      });

      setMatches(mappedData as unknown as MatchReal[])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los matches.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarMatches() }, [cargarMatches])

  const handleAccion = async (matchId: string, accion: 'aceptar' | 'rechazar' | 'contactar') => {
    const supabase = createClient()
    let nuevoEstado: EstadoMatch | null = null
    if (accion === 'aceptar')  nuevoEstado = 'contactado'
    if (accion === 'rechazar') nuevoEstado = 'cerrado'

    if (nuevoEstado) {
      await supabase.from('matches').update({ estado: nuevoEstado }).eq('id', matchId)
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, estado: nuevoEstado! } : m))
    }
  }

  const matchesFiltrados = filtro === 'todos' ? matches : matches.filter(m => m.estado === filtro)
  const totalSugeridos  = matches.filter(m => m.estado === 'sugerido').length
  const totalActivos    = matches.filter(m => m.estado === 'activo').length
  const scorePromedio   = matches.length > 0
    ? Math.round(matches.reduce((a, m) => a + m.score_match, 0) / matches.length)
    : 0

  const FILTROS: Array<{ valor: EstadoMatch | 'todos'; label: string }> = [
    { valor: 'todos',      label: 'Todos'       },
    { valor: 'sugerido',   label: 'Sugeridos'   },
    { valor: 'contactado', label: 'Contactados' },
    { valor: 'activo',     label: 'Activos'     },
    { valor: 'cerrado',    label: 'Cerrados'    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-3xl font-extrabold uppercase font-display text-slate-900 tracking-wide flex items-center gap-3">
              <Handshake className="w-8 h-8 text-[#F34B26]" />
              Mis Mentorías
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Estudiantes sugeridos por el sistema según compatibilidad de perfil.
            </p>
          </div>
          <Link href="/network" className="text-xs font-bold text-[#F34B26] hover:text-[#C82A08] hover:underline uppercase tracking-wider">
            Ver directorio completo →
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Sugeridos', value: totalSugeridos, color: 'text-[#F34B26]',    bg: 'bg-orange-50 border-[#F34B26]/20'       },
            { label: 'Activos',   value: totalActivos,   color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Score prom.', value: `${scorePromedio}pts`, color: 'text-[#FF9B18]', bg: 'bg-[#FF9B18]/10 border-[#FF9B18]/20' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            ⚠️ {error} — Asegúrate de tener conexión y un perfil actualizado.
          </div>
        )}

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#F34B26] rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Cargando matches...</p>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTROS.map(({ valor, label }) => (
                <button key={valor} type="button" onClick={() => setFiltro(valor)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    filtro === valor
                      ? 'bg-[#F34B26] text-white border-[#F34B26]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}>
                  {label}
                  {valor !== 'todos' && (
                    <span className="ml-1.5 opacity-70">({matches.filter(m => m.estado === valor).length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Grid de matches */}
            {matchesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-600 mb-1">
                  {filtro === 'todos'
                    ? 'Aún no tienes matches generados'
                    : `No hay matches en estado "${filtro}"`}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  {filtro === 'todos'
                    ? 'Actualiza tu perfil con tus áreas de interés y el sistema encontrará estudiantes compatibles.'
                    : 'Cambia el filtro para ver otros matches.'}
                </p>
                {filtro !== 'todos' && (
                  <button type="button" onClick={() => setFiltro('todos')}
                    className="mt-4 text-xs font-bold text-[#F34B26] hover:underline uppercase tracking-wider">
                    Ver todos los matches
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {matchesFiltrados.map(match => (
                  <TarjetaMatch key={match.id} match={match} onAccion={handleAccion} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
