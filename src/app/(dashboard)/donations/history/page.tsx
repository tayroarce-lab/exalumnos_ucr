'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, XCircle, ArrowLeft, Heart, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'

// ============================================================
// TIPOS
// ============================================================
type EstadoDonacion = 'pendiente' | 'confirmada' | 'rechazada'

interface Donacion {
  id: string
  fondo: string
  monto: number
  moneda: 'CRC' | 'USD'
  metodo: 'sinpe' | 'transferencia_bancaria'
  fecha_transferencia: string
  numero_referencia?: string
  mensaje?: string
  estado: EstadoDonacion
  motivo_rechazo?: string
  created_at: string
}

// ============================================================
// MOCK DATA — reemplazar con query Supabase:
// supabase.from('donaciones').select('*').eq('exalumno_id', userId).order('created_at', { ascending: false })
// ============================================================
const MOCK_HISTORIAL: Donacion[] = [
  {
    id: '1',
    fondo: 'Becas de Excelencia Alumni UCR',
    monto: 50000,
    moneda: 'CRC',
    metodo: 'sinpe',
    fecha_transferencia: '2026-06-04T10:30:00',
    numero_referencia: 'UCR-928471',
    mensaje: '¡Mucho éxito en tus estudios!',
    estado: 'confirmada',
    created_at: '2026-06-04T10:45:00',
  },
  {
    id: '2',
    fondo: 'Fondo de Emergencia Estudiantil',
    monto: 25000,
    moneda: 'CRC',
    metodo: 'transferencia_bancaria',
    fecha_transferencia: '2026-05-20T15:00:00',
    numero_referencia: 'UCR-741233',
    estado: 'pendiente',
    created_at: '2026-05-20T15:30:00',
  },
  {
    id: '3',
    fondo: 'Fondo General',
    monto: 100,
    moneda: 'USD',
    metodo: 'sinpe',
    fecha_transferencia: '2026-04-10T09:00:00',
    estado: 'rechazada',
    motivo_rechazo: 'El comprobante adjunto no corresponde al monto indicado. Por favor intenta de nuevo.',
    created_at: '2026-04-10T09:15:00',
  },
]

// ============================================================
// HELPERS
// ============================================================
function formatCurrency(val: number, moneda: 'CRC' | 'USD') {
  if (moneda === 'CRC') return `₡${val.toLocaleString('es-CR')}`
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

// ============================================================
// BADGE DE ESTADO
// ============================================================
function EstadoBadge({ estado }: { estado: EstadoDonacion }) {
  const map = {
    confirmada: { label: 'Confirmada', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 border-amber-200', Icon: Clock },
    rechazada: { label: 'Rechazada', color: 'bg-rose-100 text-rose-700 border-rose-200', Icon: XCircle },
  }
  const { label, color, Icon } = map[estado]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${color}`}>
      <Icon className="w-3 h-3" />{label}
    </span>
  )
}

// ============================================================
// TARJETA DE DONACIÓN
// ============================================================
function DonacionCard({ d }: { d: Donacion }) {
  const [open, setOpen] = useState(false)
  const metodoLabel = d.metodo === 'sinpe' ? '📱 SINPE Móvil' : '🏦 Transferencia Bancaria'

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Fila principal */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-900 uppercase tracking-wide leading-tight">{d.fondo}</p>
            <p className="text-xs text-slate-500 font-medium">{formatDate(d.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-14 sm:ml-0">
          <div className="text-right">
            <p className="text-lg font-black text-blue-700">{formatCurrency(d.monto, d.moneda)}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{metodoLabel}</p>
          </div>
          <EstadoBadge estado={d.estado} />
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
        </div>
      </button>

      {/* Detalle expandible */}
      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Fecha Transferencia</p>
              <p className="text-slate-800 font-semibold">{formatDate(d.fecha_transferencia)}</p>
            </div>
            {d.numero_referencia && (
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">N.° Referencia</p>
                <p className="font-mono text-slate-800 font-bold">{d.numero_referencia}</p>
              </div>
            )}
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Método</p>
              <p className="text-slate-800 font-semibold">{metodoLabel}</p>
            </div>
          </div>

          {d.mensaje && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tu mensaje</p>
              <p className="text-xs text-slate-600 font-medium italic">"{d.mensaje}"</p>
            </div>
          )}

          {d.estado === 'rechazada' && d.motivo_rechazo && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Motivo de rechazo</p>
              <p className="text-xs text-rose-700 font-medium">{d.motivo_rechazo}</p>
              <Link href="/donations">
                <Button variant="primary" className="mt-2 bg-rose-600 hover:bg-rose-700 text-xs font-bold uppercase tracking-wider px-4 py-2">
                  Reintentar donación →
                </Button>
              </Link>
            </div>
          )}

          {d.estado === 'pendiente' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                Tu donación está siendo revisada. El equipo la confirmará en un máximo de <strong>48 horas hábiles</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// PÁGINA DE HISTORIAL
// ============================================================
export default function DonationsHistoryPage() {
  const [filtro, setFiltro] = useState<EstadoDonacion | 'todas'>('todas')

  const filtered = MOCK_HISTORIAL.filter(d => filtro === 'todas' || d.estado === filtro)

  const totales = {
    confirmadas: MOCK_HISTORIAL.filter(d => d.estado === 'confirmada').length,
    pendientes: MOCK_HISTORIAL.filter(d => d.estado === 'pendiente').length,
    rechazadas: MOCK_HISTORIAL.filter(d => d.estado === 'rechazada').length,
    totalCRC: MOCK_HISTORIAL.filter(d => d.estado === 'confirmada' && d.moneda === 'CRC').reduce((s, d) => s + d.monto, 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-8 px-6 lg:px-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="pt-2">
          <Link href="/donations" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors uppercase tracking-wider mb-3">
            <ArrowLeft className="w-4 h-4" /> Volver a Donaciones
          </Link>
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">Mis Donaciones</h1>
          <p className="text-sm text-slate-600 font-medium">Historial completo de todas tus contribuciones a la comunidad UCR.</p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Confirmadas', value: totales.confirmadas, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { label: 'Pendientes', value: totales.pendientes, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
            { label: 'Rechazadas', value: totales.rechazadas, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
            { label: 'Total aportado', value: `₡${totales.totalCRC.toLocaleString()}`, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`${bg} ${border} border rounded-2xl p-4 text-center space-y-1`}>
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { v: 'todas', label: 'Todas' },
            { v: 'confirmada', label: '✅ Confirmadas' },
            { v: 'pendiente', label: '⏳ Pendientes' },
            { v: 'rechazada', label: '❌ Rechazadas' },
          ] as { v: EstadoDonacion | 'todas'; label: string }[]).map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setFiltro(v)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                filtro === v ? 'bg-blue-700 text-white border-blue-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map(d => <DonacionCard key={d.id} d={d} />)
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Sin donaciones en este estado</p>
              <Link href="/donations" className="inline-block mt-4">
                <Button variant="primary" className="bg-blue-700 hover:bg-blue-800 text-xs font-bold uppercase tracking-wider px-5">
                  Realizar una donación →
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
