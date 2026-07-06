'use client'
import { getAvatarUrl } from '@/lib/utils';

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Handshake, GraduationCap, Briefcase, MessageCircle, Check,
  X, Users, Clock, Star, BookOpen, ChevronDown, ChevronUp, User,
  AlertTriangle
} from 'lucide-react'
import Card from '@/components/ui/card'

//  TIPOS 
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
  tipo_apoyo: string
  created_at: string
  estudiante: Estudiante | null
}

//  CONFIG DE ESTADO 
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

//  TARJETA DE MATCH 
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
    <article className="group relative bg-white rounded-3xl border border-slate-200/80 p-1.5 transition-all duration-500 hover:shadow-xl hover:shadow-[#F34B26]/5 hover:-translate-y-1 overflow-hidden">
      <div className="relative bg-white rounded-[1.3rem] overflow-hidden h-full flex flex-col">
        {/* Cabecera con score */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${getScoreColor(match.score_match)} flex flex-col items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-500`}>
            <span className="text-white text-2xl font-black leading-none tracking-tighter">{match.score_match}</span>
            <span className="text-white/90 text-[10px] font-bold uppercase tracking-wider mt-0.5">pts</span>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-3 mb-2">
              {/* Avatar */}
              {est?.foto_url ? (
                <img src={getAvatarUrl(est.foto_url) as string} alt={nombre} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F34B26] to-[#FF9B18] text-white text-sm font-bold flex items-center justify-center ring-2 ring-slate-100 shadow-sm">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-900 truncate group-hover:text-[#F34B26] transition-colors">{nombre}</p>
                {est?.carrera_principal && (
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{est.carrera_principal}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-2.5">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${estadoConf.clase}`}>
                {estadoConf.label}
              </span>
              {match.tipo_apoyo && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50/80 text-blue-700 border border-blue-100 capitalize inline-flex items-center gap-1.5">
                  {match.tipo_apoyo === 'mentoria' ? <GraduationCap size={12} /> : match.tipo_apoyo === 'empleo' ? <Briefcase size={12} /> : <Users size={12} />}
                  {match.tipo_apoyo}
                </span>
              )}
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                {new Date(match.created_at).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-grow" />

        {/* Acciones */}
        {match.estado === 'sugerido' && (
          <div className="flex gap-2 px-5 pb-5 pt-2">
            <button type="button" disabled={pendiente} onClick={() => handleAccion('rechazar')}
              className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50 disabled:hover:bg-red-50 disabled:hover:text-red-600 group/btn">
              <X className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> <span className="hidden sm:inline">Rechazar</span>
            </button>
            <button type="button" disabled={pendiente} onClick={() => handleAccion('contactar')}
              className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-800 hover:text-white hover:border-slate-800 hover:shadow-lg hover:shadow-slate-800/20 transition-all disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-700 group/btn">
              <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> <span className="hidden sm:inline">Contactar</span>
            </button>
            <button type="button" disabled={pendiente} onClick={() => handleAccion('aceptar')}
              className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl bg-emerald-500 border border-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 hover:border-emerald-600 shadow-md hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 group/btn">
              <Check className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> <span className="hidden sm:inline">Aceptar</span>
            </button>
          </div>
        )}

        {(match.estado === 'contactado' || match.estado === 'activo') && (
          <div className="px-5 pb-5 pt-2">
            <Link href={`/network/${est?.id || ''}`}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm hover:shadow-md ${match.estado === 'activo' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-emerald-500/20' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-amber-500/20'}`}>
              <User className="w-4 h-4" /> Ver perfil de conexión
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}

//  PÁGINA PRINCIPAL 
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

      // Leer el rol real desde la tabla users (no user_metadata que puede estar desactualizado)
      const { data: userData } = await supabase
        .from('users')
        .select('rol')
        .eq('id', user.id)
        .single()

      const rol = userData?.rol ?? 'estudiante'
      const isExalumno = rol === 'exalumno'

      // Filtrar estrictamente por el FK correcto según el rol del usuario
      let query = supabase
        .from('matches')
        .select(`
          id,
          score_match,
          estado,
          tipo_apoyo,
          created_at,
          exalumno_id,
          estudiante_id,
          contraparte_ex:users!matches_exalumno_id_fkey (
            id, nombre, apellidos, foto_url, rol
          ),
          contraparte_est:users!matches_estudiante_id_fkey (
            id, nombre, apellidos, foto_url, rol
          )
        `)
        .in('tipo_apoyo', ['mentoria', 'mentoría'])
        .in('estado', ['sugerido', 'contactado', 'activo', 'cerrado'])
        .order('score_match', { ascending: false })

      // Filtrar solo MIS matches (no todos los de la tabla)
      if (isExalumno) {
        query = query.eq('exalumno_id', user.id)
      } else {
        query = query.eq('estudiante_id', user.id)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw new Error(fetchError.message)

      const mappedData = (data ?? []).map((m: any) => {
        // La "otra persona" es siempre la contraparte (quien NO soy yo)
        const contraparteRaw = isExalumno
          ? (Array.isArray(m.contraparte_est) ? m.contraparte_est[0] : m.contraparte_est)
          : (Array.isArray(m.contraparte_ex)  ? m.contraparte_ex[0]  : m.contraparte_ex)

        return {
          ...m,
          estudiante: contraparteRaw ? {
            id:                contraparteRaw.id,
            nombre:            contraparteRaw.nombre,
            apellidos:         contraparteRaw.apellidos,
            foto_url:          contraparteRaw.foto_url,
            carrera_principal: null,
            proyecto_titulo:   null,
          } : null,
        }
      }).filter(m => m.estudiante !== null)

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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 bg-transparent transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60 relative">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#F34B26]/5 rounded-full blur-3xl -z-10" />
          <div className="absolute -top-12 -right-24 w-48 h-48 bg-[#FF9B18]/5 rounded-full blur-2xl -z-10" />
          
          <div className="space-y-3 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34B26]/10 text-[#F34B26] text-[10px] font-black uppercase tracking-widest border border-[#F34B26]/20">
              <Star className="w-3 h-3 fill-current" />
              Programa Alumni
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-display text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 tracking-tight flex items-center gap-4">
              Mis Mentorías
            </h1>
            <p className="text-slate-500 font-medium text-base md:text-lg max-w-xl">
              Tus matches y conexiones activas de mentoría con estudiantes y exalumnos UCR.
            </p>
          </div>
          <Link href="/network" className="group z-10 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border-2 border-slate-100 text-sm font-bold text-slate-700 hover:border-[#F34B26] hover:text-[#F34B26] hover:shadow-xl hover:shadow-[#F34B26]/10 transition-all duration-300">
            <span>Ver directorio completo</span>
            <div className="bg-slate-100 p-1 rounded-full group-hover:bg-[#F34B26]/10 transition-colors">
              <ChevronUp className="w-4 h-4 rotate-90" />
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Sugeridos', value: totalSugeridos, color: 'text-[#F34B26]',  bg: 'bg-gradient-to-br from-white to-orange-50/50', border: 'border-orange-100/80', icon: <Users className="w-5 h-5 text-[#F34B26]/50" /> },
            { label: 'Activos',   value: totalActivos,   color: 'text-emerald-500', bg: 'bg-gradient-to-br from-white to-emerald-50/50', border: 'border-emerald-100/80', icon: <Handshake className="w-5 h-5 text-emerald-500/50" /> },
            { label: 'Score Prom.', value: `${scorePromedio}pts`, color: 'text-[#FF9B18]', bg: 'bg-gradient-to-br from-white to-amber-50/50', border: 'border-amber-100/80', icon: <Star className="w-5 h-5 text-[#FF9B18]/50" /> },
          ].map(stat => (
            <div key={stat.label} className={`relative group overflow-hidden ${stat.bg} border ${stat.border} rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1`}>
              <div className="absolute top-4 right-4">{stat.icon}</div>
              <p className={`text-4xl sm:text-5xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error} — Asegúrate de tener conexión y un perfil actualizado.</span>
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
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {FILTROS.map(({ valor, label }) => (
                <button key={valor} type="button" onClick={() => setFiltro(valor)}
                  className={`snap-start flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border-2 ${
                    filtro === valor
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  {label}
                  {valor !== 'todos' && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${filtro === valor ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {matches.filter(m => m.estado === valor).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Grid de matches */}
            {matchesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-3xl text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Users className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2 font-display uppercase tracking-wide">
                  {filtro === 'todos'
                    ? 'Aún no tienes matches generados'
                    : `No hay matches en estado "${filtro}"`}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
                  {filtro === 'todos'
                    ? 'Actualiza tu perfil con tus áreas de interés y el sistema encontrará estudiantes compatibles utilizando nuestro algoritmo de matching.'
                    : 'Intenta cambiar el filtro para explorar otras conexiones de mentoría.'}
                </p>
                {filtro !== 'todos' && (
                  <button type="button" onClick={() => setFiltro('todos')}
                    className="px-6 py-3 bg-[#F34B26] hover:bg-[#C82A08] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#F34B26]/20">
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
