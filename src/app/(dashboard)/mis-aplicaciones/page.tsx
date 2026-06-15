'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import { Briefcase, Clock, CheckCircle, XCircle, Eye, AlertCircle, RefreshCw } from 'lucide-react'
import { getMyApplications } from '@/actions/applications'
import { ApplicationStatus, STATUS_MESSAGES, STATUS_COLORS } from '@/types/applications'

// ─── HELPERS VISUALES ────────────────────────────────────────────────────────

function getBadgeEstado(status: ApplicationStatus) {
  switch (status) {
    case 'enviada':
      return { label: STATUS_MESSAGES[status], clase: 'bg-slate-100 text-slate-600', icon: Clock }
    case 'en_revision':
      return { label: STATUS_MESSAGES[status], clase: 'bg-yellow-100 text-yellow-700', icon: Eye }
    case 'seleccionado':
      return { label: STATUS_MESSAGES[status], clase: 'bg-green-100 text-green-700', icon: CheckCircle }
    case 'descartado':
      return { label: STATUS_MESSAGES[status], clase: 'bg-gray-100 text-gray-600', icon: XCircle }
  }
}

function formatearFecha(isoString: string) {
  return new Date(isoString).toLocaleDateString('es-CR', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export default function MisAplicacionesPage() {
  const { user } = useProfile()
  const [aplicaciones, setAplicaciones] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarAplicaciones = useCallback(async () => {
    if (!user) return
    setCargando(true)
    setError(null)
    try {
      const data = await getMyApplications()
      setAplicaciones(data)
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar tus aplicaciones.')
    } finally {
      setCargando(false)
    }
  }, [user])

  useEffect(() => {
    cargarAplicaciones()
  }, [cargarAplicaciones])

  const stats = {
    total: aplicaciones.length,
    activas: aplicaciones.filter(a => a.status === 'enviada' || a.status === 'en_revision').length,
    seleccionadas: aplicaciones.filter(a => a.status === 'seleccionado').length,
    descartadas: aplicaciones.filter(a => a.status === 'descartado').length,
  }

  return (
    <div className="py-8 px-6 lg:px-10 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase font-display text-slate-900 tracking-wide flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-blue-600" /> Mis Aplicaciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">Seguimiento de tus postulaciones a posiciones UCR.</p>
        </div>
        <button
          onClick={cargarAplicaciones}
          disabled={cargando}
          className="p-2 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
          { label: 'Activas', value: stats.activas, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Seleccionado/a', value: stats.seleccionadas, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Descartadas', value: stats.descartadas, color: 'text-gray-600', bg: 'bg-gray-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-white/50`}>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {cargando && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Cargando tus aplicaciones…</p>
        </div>
      )}

      {error && !cargando && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {!cargando && !error && aplicaciones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-slate-300 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800">Aún no has aplicado a ninguna posición</p>
          </div>
        </div>
      )}

      {!cargando && !error && aplicaciones.length > 0 && (
        <div className="space-y-4">
          {aplicaciones.map((app) => {
            const badge = getBadgeEstado(app.status)
            const Icon = badge.icon
            return (
              <div key={app.id} className="bg-white border rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center shadow-sm border-slate-200">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${badge.clase}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-base truncate">{app.position.titulo}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${badge.clase}`}>
                      <Icon className="w-3.5 h-3.5" /> {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{app.position.alumni_name}</p>
                  {app.message && <p className="mt-2 text-xs text-slate-500 italic line-clamp-2">"{app.message}"</p>}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400 font-medium">
                    <span>Aplicado: {formatearFecha(app.created_at)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
