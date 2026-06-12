'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Mail, GraduationCap, Clock, AlertCircle, CheckCircle2, XCircle, Eye, ChevronDown } from 'lucide-react'
import { obtenerAplicantesPorPosicion, actualizarEstadoAplicacion } from '@/actions/positions'
import Card from '@/components/ui/card'

type AplicantesData = Awaited<ReturnType<typeof obtenerAplicantesPorPosicion>>
type Aplicacion = AplicantesData['aplicantes'][number]

const ESTADOS: Array<{
  valor: 'pendiente' | 'en_revision' | 'entrevistado' | 'aceptado' | 'rechazado'
  label: string
  bg: string
  text: string
  dot: string
}> = [
  { valor: 'pendiente',    label: 'Pendiente',    bg: 'bg-slate-100',    text: 'text-slate-600',   dot: 'bg-slate-400'   },
  { valor: 'en_revision',  label: 'En Revisión',  bg: 'bg-blue-50',      text: 'text-blue-700',    dot: 'bg-blue-500'    },
  { valor: 'entrevistado', label: 'Entrevistado', bg: 'bg-violet-50',    text: 'text-violet-700',  dot: 'bg-violet-500'  },
  { valor: 'aceptado',     label: 'Aceptado',     bg: 'bg-emerald-50',   text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { valor: 'rechazado',    label: 'Rechazado',    bg: 'bg-red-50',       text: 'text-red-700',     dot: 'bg-red-500'     },
]

function getEstadoConf(estado: string) {
  return ESTADOS.find(e => e.valor === estado) ?? ESTADOS[0]
}

function TarjetaAplicante({ aplicacion, onCambiarEstado }: {
  aplicacion: Aplicacion
  onCambiarEstado: (id: string, estado: 'pendiente' | 'en_revision' | 'entrevistado' | 'aceptado' | 'rechazado') => Promise<void>
}) {
  const [actualizando, setActualizando] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  const estudiante = (aplicacion.estudiante as unknown) as {
    id: string; nombre: string; apellidos: string | null
    email: string; foto_url: string | null; carrera_principal: string | null
  } | null

  const estadoConf = getEstadoConf(aplicacion.estado)
  const nombre = estudiante ? `${estudiante.nombre} ${estudiante.apellidos ?? ''}`.trim() : 'Estudiante'
  const initials = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  const handleCambio = async (nuevoEstado: typeof ESTADOS[number]['valor']) => {
    setMenuAbierto(false)
    setActualizando(true)
    await onCambiarEstado(aplicacion.id, nuevoEstado)
    setActualizando(false)
  }

  return (
    <Card hoverEffect={false} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {estudiante?.foto_url ? (
          <img src={estudiante.foto_url} alt={nombre} className="w-12 h-12 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-institutional to-blue-700 text-white flex items-center justify-center font-bold text-base shrink-0">
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-sm">{nombre}</h3>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoConf.bg} ${estadoConf.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${estadoConf.dot}`} />
              {estadoConf.label}
            </span>
          </div>

          {estudiante?.carrera_principal && (
            <p className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <GraduationCap className="w-3 h-3" />
              {estudiante.carrera_principal}
            </p>
          )}

          {estudiante?.email && (
            <a href={`mailto:${estudiante.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2">
              <Mail className="w-3 h-3" />
              {estudiante.email}
            </a>
          )}

          {aplicacion.mensaje_presentacion && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed italic mb-3">
              "{aplicacion.mensaje_presentacion}"
            </div>
          )}

          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            Aplicó el {new Date(aplicacion.created_at).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Cambiar estado */}
        <div className="relative shrink-0">
          <button
            type="button"
            disabled={actualizando}
            onClick={() => setMenuAbierto(prev => !prev)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {actualizando ? 'Guardando...' : 'Cambiar estado'}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {menuAbierto && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
              {ESTADOS.map(est => (
                <button
                  key={est.valor}
                  type="button"
                  onClick={() => handleCambio(est.valor)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors text-left ${
                    aplicacion.estado === est.valor ? 'text-institutional' : 'text-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${est.dot}`} />
                  {est.label}
                  {aplicacion.estado === est.valor && <CheckCircle2 className="w-3 h-3 ml-auto text-institutional" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

interface AplicantesPageProps {
  params: { id: string }
}

export default function AplicantesPage({ params }: AplicantesPageProps) {
  const { id } = params
  const [data, setData] = useState<AplicantesData | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await obtenerAplicantesPorPosicion(id)
      setData(resultado)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar aplicantes.')
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  const handleCambiarEstado = async (
    aplicacionId: string,
    nuevoEstado: 'pendiente' | 'en_revision' | 'entrevistado' | 'aceptado' | 'rechazado'
  ) => {
    await actualizarEstadoAplicacion(aplicacionId, nuevoEstado)
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        aplicantes: prev.aplicantes.map(a =>
          a.id === aplicacionId ? { ...a, estado: nuevoEstado } : a
        )
      }
    })
  }

  const aplicantesFiltrados = !data ? [] : filtroEstado === 'todos'
    ? data.aplicantes
    : data.aplicantes.filter(a => a.estado === filtroEstado)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <Link href="/mis-posiciones" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-institutional transition-colors uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Posiciones
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold uppercase font-display text-slate-900 tracking-wide">
            Aplicantes
          </h1>
          {data && (
            <p className="text-sm text-slate-500 font-medium mt-1">
              <span className="font-bold text-slate-700">{data.posicion.titulo}</span>
              {' · '}{data.posicion.empresa}
            </p>
          )}
        </div>

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-institutional rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Cargando aplicantes...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : (
          <>
            {/* Stats por estado */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltroEstado('todos')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  filtroEstado === 'todos'
                    ? 'bg-institutional text-white border-institutional'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                Todos ({data?.aplicantes.length ?? 0})
              </button>
              {ESTADOS.map(est => {
                const count = data?.aplicantes.filter(a => a.estado === est.valor).length ?? 0
                if (count === 0) return null
                return (
                  <button
                    key={est.valor}
                    type="button"
                    onClick={() => setFiltroEstado(est.valor)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      filtroEstado === est.valor
                        ? `${est.bg} ${est.text} border-current`
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${est.dot}`} />
                    {est.label} ({count})
                  </button>
                )
              })}
            </div>

            {/* Lista */}
            {aplicantesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-600 mb-1">Sin aplicantes aún</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Cuando un estudiante aplique a esta vacante, aparecerá aquí para que puedas revisarlo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {aplicantesFiltrados.map(aplicacion => (
                  <TarjetaAplicante
                    key={aplicacion.id}
                    aplicacion={aplicacion}
                    onCambiarEstado={handleCambiarEstado}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
