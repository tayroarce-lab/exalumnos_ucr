'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Briefcase, Plus, Edit3, Trash2, PauseCircle, PlayCircle,
  Users, Clock, MapPin, CheckCircle2, AlertCircle, Eye
} from 'lucide-react'
import { obtenerMisPosiciones, actualizarEstadoPosicion, eliminarPosicionLogica } from '@/actions/positions'
import { useProfile } from '@/contexts/ProfileContext'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'

type Posicion = Awaited<ReturnType<typeof obtenerMisPosiciones>>[number]

const ESTADO_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  activa:  { label: 'Activa',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pausada: { label: 'Pausada',  bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  cerrada: { label: 'Cerrada',  bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400'   },
  cubierta:{ label: 'Cubierta', bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
}

const TIPO_CONFIG: Record<string, { label: string; icon: string }> = {
  empleo:   { label: 'Empleo',   icon: '💼' },
  pasantia: { label: 'Pasantía', icon: '📋' },
  proyecto: { label: 'Proyecto', icon: '🤝' },
}

export default function MisPosicionesPage() {
  const [posiciones, setPosiciones] = useState<Posicion[]>([])
  const [cargando, setCargando] = useState(true)
  const [accionando, setAccionando] = useState<string | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useProfile()
  const isStudent = user?.user_metadata?.rol === 'estudiante'

  const cargarPosiciones = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await obtenerMisPosiciones()
      setPosiciones(data ?? [])
    } catch (e) {
      setError('No se pudieron cargar tus publicaciones. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarPosiciones() }, [cargarPosiciones])

  const handleEstado = async (id: string, nuevoEstado: 'activa' | 'pausada' | 'cerrada' | 'cubierta') => {
    setAccionando(id)
    try {
      await actualizarEstadoPosicion(id, nuevoEstado)
      setPosiciones(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p))
    } catch {
      setError('No se pudo actualizar el estado.')
    } finally {
      setAccionando(null)
    }
  }

  const handleEliminar = async (id: string) => {
    setAccionando(id)
    setConfirmarEliminar(null)
    try {
      await eliminarPosicionLogica(id)
      setPosiciones(prev => prev.filter(p => p.id !== id))
    } catch {
      setError('No se pudo eliminar la publicación.')
    } finally {
      setAccionando(null)
    }
  }

  const activas   = posiciones.filter(p => p.estado === 'activa').length
  const pausadas  = posiciones.filter(p => p.estado === 'pausada').length
  const cerradas  = posiciones.filter(p => ['cerrada', 'cubierta'].includes(p.estado ?? '')).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-3xl font-extrabold uppercase font-display text-slate-900 tracking-wide">
              Mis Publicaciones
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Gestiona tus empleos y pasantías publicadas en la plataforma.
            </p>
          </div>
          {!isStudent && (
            <Link href="/jobs/publish">
              <Button className="flex items-center gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                Nueva Publicación
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Activas',  value: activas,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Pausadas', value: pausadas,  color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100'     },
            { label: 'Cerradas', value: cerradas,  color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200'     },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border rounded-2xl p-4 text-center`}>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Lista */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-institutional rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Cargando publicaciones...</p>
          </div>
        ) : posiciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-300 rounded-2xl text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">No tienes publicaciones aún</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              {isStudent ? 'No tienes permiso para crear publicaciones.' : 'Crea tu primera oferta de empleo o pasantía para conectar con estudiantes UCR.'}
            </p>
            {!isStudent && (
              <Link href="/jobs/publish">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Publicar Ahora
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posiciones.map(pos => {
              const estadoConf = ESTADO_CONFIG[pos.estado ?? 'activa'] ?? ESTADO_CONFIG['activa']
              const tipoConf   = TIPO_CONFIG[pos.tipo ?? 'empleo'] ?? TIPO_CONFIG['empleo']
              const estaAccionando = accionando === pos.id
              const estaActiva = pos.estado === 'activa'

              return (
                <Card key={pos.id} hoverEffect={false} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                    {/* Ícono tipo */}
                    <div className="w-12 h-12 rounded-xl bg-institutional/10 text-institutional flex items-center justify-center text-2xl shrink-0">
                      {tipoConf.icon}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="font-bold text-slate-900 text-base leading-tight truncate">{pos.titulo}</h2>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${estadoConf.bg} ${estadoConf.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${estadoConf.dot}`} />
                          {estadoConf.label}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {tipoConf.label}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-blue-700 mb-2">{pos.empresa}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                        {pos.lugar && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pos.lugar}</span>
                        )}
                        {pos.modalidad && (
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{pos.modalidad}</span>
                        )}
                        {pos.created_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(pos.created_at).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Habilidades */}
                      {pos.habilidades_requeridas && pos.habilidades_requeridas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {pos.habilidades_requeridas.slice(0, 4).map((h: string) => (
                            <span key={h} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                          {pos.habilidades_requeridas.length > 4 && (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">+{pos.habilidades_requeridas.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      {/* Ver aplicantes */}
                      <Link href={`/mis-posiciones/${pos.id}/aplicantes`}>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors w-full"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Ver aplicantes
                        </button>
                      </Link>

                      {/* Pausar / Activar */}
                      <button
                        type="button"
                        disabled={estaAccionando}
                        onClick={() => handleEstado(pos.id, estaActiva ? 'pausada' : 'activa')}
                        className={`flex items-center gap-1.5 text-xs font-bold border px-3 py-2 rounded-xl transition-colors disabled:opacity-50 ${
                          estaActiva
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                        }`}
                      >
                        {estaActiva ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                        {estaActiva ? 'Pausar' : 'Activar'}
                      </button>

                      {/* Marcar como cubierta */}
                      {pos.estado !== 'cubierta' && pos.estado !== 'cerrada' && (
                        <button
                          type="button"
                          disabled={estaAccionando}
                          onClick={() => handleEstado(pos.id, 'cubierta')}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Cubierta
                        </button>
                      )}

                      {/* Eliminar */}
                      {confirmarEliminar === pos.id ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEliminar(pos.id)}
                            disabled={estaAccionando}
                            className="flex-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-2 rounded-xl transition-colors disabled:opacity-50"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmarEliminar(null)}
                            className="flex-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-2 rounded-xl transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmarEliminar(pos.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
