'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useProfile } from '@/contexts/ProfileContext'
import { Briefcase, Clock, CheckCircle, XCircle, Eye, AlertCircle, RefreshCw, Sparkles } from 'lucide-react'
import { getMyApplications } from '@/actions/applications'
import { ApplicationStatus, STATUS_MESSAGES } from '@/types/applications'

// ─── HELPERS VISUALES ────────────────────────────────────────────────────────

function getBadgeEstado(status: ApplicationStatus) {
  switch (status) {
    case 'enviada':
      return { 
        label: STATUS_MESSAGES[status], 
        clase: 'bg-celeste/10 text-brand-blue border border-celeste/30', 
        icon: Clock 
      }
    case 'en_revision':
      return { 
        label: STATUS_MESSAGES[status], 
        clase: 'bg-yellow-50 text-amber-700 border border-yellow-300/50', 
        icon: Eye 
      }
    case 'seleccionado':
      return { 
        label: STATUS_MESSAGES[status], 
        clase: 'bg-emerald-50 text-emerald-700 border border-emerald-300/50', 
        icon: CheckCircle 
      }
    case 'descartado':
      return { 
        label: STATUS_MESSAGES[status], 
        clase: 'bg-slate-100 text-slate-500 border border-slate-200', 
        icon: XCircle 
      }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-celeste text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Seguimiento de aplicaciones</span>
          </div>
          <h1 className="text-3xl font-extrabold uppercase font-display text-slate-800 tracking-wide flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-celeste" /> Mis Aplicaciones
          </h1>
          <p className="text-sm text-slate-500 font-medium">Seguimiento en tiempo real de tus postulaciones a posiciones UCR.</p>
        </div>
        <button
          onClick={cargarAplicaciones}
          disabled={cargando}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-celeste hover:border-celeste/40 hover:bg-celeste/5 bg-white transition-all duration-200 disabled:opacity-40 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-white/80', border: 'border-slate-200/70 hover:border-slate-300' },
          { label: 'Activas', value: stats.activas, color: 'text-brand-blue', bg: 'bg-celeste/5', border: 'border-celeste/20 hover:border-celeste/40' },
          { label: 'Seleccionado/a', value: stats.seleccionadas, color: 'text-emerald-700', bg: 'bg-emerald-50/30', border: 'border-emerald-200/50 hover:border-emerald-300' },
          { label: 'Descartadas', value: stats.descartadas, color: 'text-slate-500', bg: 'bg-slate-50/50', border: 'border-slate-200/50 hover:border-slate-300' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`stats-card ${bg} ${border} rounded-2xl p-5 text-center border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}>
            <p className={`text-3xl font-black ${color} tracking-tight`}>{value}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {cargando && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white/50 rounded-2xl border border-dashed border-slate-200">
          <RefreshCw className="w-8 h-8 text-celeste animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Cargando tus aplicaciones…</p>
        </div>
      )}

      {error && !cargando && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {!cargando && !error && aplicaciones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-slate-300 rounded-2xl bg-white/55 backdrop-blur-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
            <Briefcase className="w-7 h-7 text-slate-400" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-slate-800">Aún no has aplicado a ninguna posición</p>
            <p className="text-xs text-slate-500 font-medium">Explora la sección de empleos para empezar.</p>
          </div>
        </div>
      )}

      {!cargando && !error && aplicaciones.length > 0 && (
        <div className="space-y-4">
          {aplicaciones.map((app) => {
            const badge = getBadgeEstado(app.status)
            const Icon = badge.icon
            return (
              <div key={app.id} className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center shadow-sm hover:shadow-lg hover:border-celeste/30 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${badge.clase}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                    <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-esmeralda transition-colors">{app.position.titulo}</h3>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badge.clase}`}>
                      <Icon className="w-3 h-3" /> {badge.label}
                    </span>
                  </div>
                  <Link href={`/network/${app.alumni_id}`} className="text-xs font-semibold text-brand-emerald hover:text-emerald-700 uppercase tracking-wide transition-colors">
                    {app.position.alumni_name}
                  </Link>
                  {app.message && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium italic relative break-words">
                      "{app.message}"
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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
