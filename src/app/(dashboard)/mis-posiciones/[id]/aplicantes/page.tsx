'use client'
import { getAvatarUrl } from '@/lib/utils';

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Mail, GraduationCap, Clock, AlertCircle, CheckCircle2, XCircle, Eye, ChevronDown, MapPin, FileText, Check } from 'lucide-react'
import { obtenerPosicionPorId } from '@/actions/positions'
import { getPositionApplications, updateApplicationStatus } from '@/actions/applications'
import Card from '@/components/ui/card'
import Modal from '@/components/ui/modal'
import Button from '@/components/ui/button'

type Aplicacion = Awaited<ReturnType<typeof getPositionApplications>>[number]
type EstadoAplicacion = 'enviada' | 'en_revision' | 'seleccionado' | 'descartado'
type EstadoTransicion = Exclude<EstadoAplicacion, 'enviada'>

const ESTADOS: Array<{
  valor: EstadoAplicacion
  label: string
  bg: string
  text: string
  dot: string
}> = [
  { valor: 'enviada',      label: 'Pendiente',    bg: 'bg-slate-100',    text: 'text-slate-600',   dot: 'bg-slate-400'   },
  { valor: 'en_revision',  label: 'En Revisión',  bg: 'bg-blue-50',      text: 'text-blue-700',    dot: 'bg-blue-500'    },
  { valor: 'seleccionado', label: 'Aceptado',     bg: 'bg-emerald-50',   text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { valor: 'descartado',   label: 'Rechazado',    bg: 'bg-red-50',       text: 'text-red-700',     dot: 'bg-red-500'     },
]

function getEstadoConf(estado: string) {
  return ESTADOS.find(e => e.valor === estado) ?? ESTADOS[0]
}

function TarjetaAplicante({ aplicacion, onCambiarEstado }: {
  aplicacion: Aplicacion
  onCambiarEstado: (id: string, estado: EstadoTransicion) => void
}) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  const estudiante = aplicacion.student
  const cv = aplicacion.cv

  const estadoConf = getEstadoConf(aplicacion.status)
  const nombre = estudiante ? estudiante.nombre : 'Estudiante'
  const initials = nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  const handleCambio = (nuevoEstado: EstadoTransicion) => {
    setMenuAbierto(false)
    onCambiarEstado(aplicacion.id, nuevoEstado)
  }

  return (
    <Card hoverEffect={false} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-4 flex-col sm:flex-row">
        {/* Avatar */}
        <div className="flex-1 w-full min-w-0 flex items-start gap-4">
          {estudiante?.foto_url ? (
            <img src={getAvatarUrl(estudiante.foto_url) as string} alt={nombre} className="w-14 h-14 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-institutional to-blue-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {initials}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 text-base">{nombre}</h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${estadoConf.bg} ${estadoConf.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${estadoConf.dot}`} />
                {estadoConf.label}
              </span>
              
              {/* Compatibilidad */}
              {aplicacion.compatibility_score !== undefined && aplicacion.compatibility_score !== null && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  ⚡ {Math.round(aplicacion.compatibility_score)}% Match
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 mt-2">
              {estudiante?.carrera && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {estudiante.carrera}
                </p>
              )}
              {estudiante?.sede && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {estudiante.sede}
                </p>
              )}
            </div>

            {aplicacion.message && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed italic mt-3 mb-2">
                "{aplicacion.message}"
              </div>
            )}

            <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Aplicó el {new Date(aplicacion.created_at).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
          {cv && (
            <Link href={`/cv/${cv.id}`} target="_blank" className="flex-1 sm:flex-none">
              <button type="button" className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-xl transition-colors">
                <FileText className="w-4 h-4" />
                Ver CV
              </button>
            </Link>
          )}

          <div className="relative flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => setMenuAbierto(prev => !prev)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2 rounded-xl transition-colors"
            >
              Cambiar estado
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {menuAbierto && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                {ESTADOS.filter((est): est is typeof est & { valor: EstadoTransicion } => est.valor !== 'enviada').map(est => (
                  <button
                    key={est.valor}
                    type="button"
                    onClick={() => handleCambio(est.valor)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors text-left ${
                      aplicacion.status === est.valor ? 'text-institutional' : 'text-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${est.dot}`} />
                    {est.label}
                    {aplicacion.status === est.valor && <CheckCircle2 className="w-3 h-3 ml-auto text-institutional" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

interface AplicantesPageProps {
  params: Promise<{ id: string }>
}

export default function AplicantesPage({ params }: AplicantesPageProps) {
  const { id } = React.use(params)
  const [posicion, setPosicion] = useState<any>(null)
  const [aplicantes, setAplicantes] = useState<Aplicacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // Estado para el modal de confirmación
  const [modalSeleccion, setModalSeleccion] = useState<{ id: string, open: boolean }>({ id: '', open: false })
  const [cerrarPosicion, setCerrarPosicion] = useState(true)
  const [actualizando, setActualizando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const pos = await obtenerPosicionPorId(id)
      setPosicion(pos)
      const apps = await getPositionApplications(id)
      setAplicantes(apps)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar aplicantes.')
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  const handleIntentarCambiarEstado = (aplicacionId: string, nuevoEstado: EstadoTransicion) => {
    if (nuevoEstado === 'seleccionado') {
      setModalSeleccion({ id: aplicacionId, open: true })
    } else {
      ejecutarCambioEstado(aplicacionId, nuevoEstado, false)
    }
  }

  const ejecutarCambioEstado = async (aplicacionId: string, nuevoEstado: EstadoTransicion, cerrar: boolean) => {
    setActualizando(true)
    const result = await updateApplicationStatus({
      application_id: aplicacionId,
      status: nuevoEstado as any,
      close_position: cerrar
    })

    if (result.success) {
      // Actualizar estado local
      setAplicantes(prev => prev.map(a => 
        a.id === aplicacionId ? { ...a, status: nuevoEstado } : (cerrar && a.id !== aplicacionId && a.status !== 'descartado') ? { ...a, status: 'descartado' } : a
      ))
      if (modalSeleccion.open) setModalSeleccion({ id: '', open: false })
    } else {
      alert(result.error || 'Ocurrió un error al actualizar.')
    }
    setActualizando(false)
  }

  const aplicantesFiltrados = aplicantes.length === 0 ? [] : filtroEstado === 'todos'
    ? aplicantes
    : aplicantes.filter(a => a.status === filtroEstado)

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
          {posicion && (
            <p className="text-sm text-slate-500 font-medium mt-1">
              <span className="font-bold text-slate-700">{posicion.titulo}</span>
              {' · '}{posicion.empresa}
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
                Todos ({aplicantes.length})
              </button>
              {ESTADOS.map(est => {
                const count = aplicantes.filter(a => a.status === est.valor).length
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
                <h3 className="text-sm font-bold text-slate-600 mb-1">Sin aplicantes {filtroEstado !== 'todos' ? 'con este estado' : 'aún'}</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  {filtroEstado !== 'todos' ? 'Prueba cambiando el filtro de estado.' : 'Cuando un estudiante aplique a esta vacante, aparecerá aquí para que puedas revisarlo.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {aplicantesFiltrados.map(aplicacion => (
                  <TarjetaAplicante
                    key={aplicacion.id}
                    aplicacion={aplicacion}
                    onCambiarEstado={handleIntentarCambiarEstado}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Confirmación */}
      <Modal isOpen={modalSeleccion.open} onClose={() => !actualizando && setModalSeleccion({ id: '', open: false })} title="Seleccionar Candidato">
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600">
            Estás a punto de marcar a este candidato como <strong>Seleccionado</strong>. Le enviaremos un correo para informarle.
          </p>

          <label className="flex items-start gap-3 p-4 border border-blue-200 bg-blue-50 rounded-xl cursor-pointer">
            <input 
              type="checkbox" 
              checked={cerrarPosicion} 
              onChange={e => setCerrarPosicion(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 rounded"
              disabled={actualizando}
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-900">Cerrar vacante y notificar al resto</p>
              <p className="text-xs text-blue-700 mt-0.5">La vacante pasará a estado "Cubierta" y a los demás candidatos se les enviará un correo anónimo de rechazo.</p>
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <Button variant="secondary" onClick={() => setModalSeleccion({ id: '', open: false })} disabled={actualizando}>Cancelar</Button>
            <Button 
              variant="primary" 
              onClick={() => ejecutarCambioEstado(modalSeleccion.id, 'seleccionado', cerrarPosicion)} 
              isLoading={actualizando}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar Selección
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
