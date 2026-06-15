'use client';
import { useSearchParams } from 'next/navigation';

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import {
  Heart, History, CheckCircle2, Upload, X, AlertCircle,
  Smartphone, Building2, Clock, FileText, Info, ArrowLeft, ArrowRight, DollarSign
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { crearDonacion } from '@/actions/donations'
import { useProfile } from '@/contexts/ProfileContext'

function ProgressFill({ value, colorClass = 'bg-blue-700' }: { value: number; colorClass?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.width = `${value}%`
    }
  }, [value])
  return <div ref={ref} className={`h-2 rounded-full transition-all duration-500 ${colorClass}`} />
}

// ============================================================
// DATOS — reemplazarán con query a Supabase
// ============================================================
const FONDOS = [
  {
    id: '1',
    title: 'Becas de Excelencia Alumni UCR',
    desc: 'Apoya el financiamiento completo de estudiantes de primer ingreso con rendimiento académico sobresaliente y vulnerabilidad socioeconómica.',
    meta: 5000000,
    raised: 3800000,
    donors: 74,
  },
  {
    id: '2',
    title: 'Fondo de Emergencia Estudiantil',
    desc: 'Ayuda inmediata para estudiantes activos frente a contingencias extremas de salud, vivienda o alimentación.',
    meta: 2000000,
    raised: 1100000,
    donors: 32,
  },
  {
    id: 'general',
    title: 'Fondo General',
    desc: 'Tu donación será asignada donde más se necesite, respaldando múltiples iniciativas de la Fundación Exalumnos UCR.',
    meta: 0,
    raised: 0,
    donors: 0,
  },
]

const INSTRUCCIONES_PAGO = {
  sinpe: {
    label: 'SINPE Móvil',
    icon: <Smartphone className="w-5 h-5" />,
    linea1: 'Número SINPE Móvil:',
    linea2: '8888-1234',
    linea3: 'Nombre: Fundación Exalumnos UCR',
    detalle: 'Desde tu aplicación bancaria, selecciona SINPE Móvil e ingresa el número y monto indicados. Incluye el número de referencia en el concepto.',
  },
  transferencia_bancaria: {
    label: 'Transferencia Bancaria (IBAN)',
    icon: <Building2 className="w-5 h-5" />,
    linea1: 'IBAN:',
    linea2: 'CR21015201001026284066',
    linea3: 'Banco Nacional de Costa Rica · Fundación Exalumnos UCR',
    detalle: 'Realiza la transferencia al IBAN indicado. Incluye el número de referencia en el concepto de la transferencia.',
  },
}

type MetodoPago = 'sinpe' | 'transferencia_bancaria'

interface FormDonacion {
  fondo_id: string
  monto: string
  moneda: 'CRC' | 'USD'
  metodo: MetodoPago | ''
  fecha_transferencia: string
  numero_referencia: string
  mensaje: string
}

const INITIAL_FORM: FormDonacion = {
  fondo_id: '',
  monto: '',
  moneda: 'CRC',
  metodo: '',
  fecha_transferencia: '',
  numero_referencia: '',
  mensaje: '',
}

function formatCurrency(val: number, moneda: 'CRC' | 'USD') {
  if (moneda === 'CRC') return `₡${val.toLocaleString('es-CR')}`
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const STEPS = [
  { id: 1, label: 'Fondo', icon: Heart },
  { id: 2, label: 'Monto', icon: DollarSign },
  { id: 3, label: 'Instrucciones', icon: Info },
  { id: 4, label: 'Comprobante', icon: Upload },
]

// ============================================================
// TARJETA DE FONDO
// ============================================================
function FondoCard({
  fondo,
  selected,
  onSelect,
}: {
  fondo: typeof FONDOS[0]
  selected: boolean
  onSelect: () => void
}) {
  const pct = fondo.meta > 0 ? Math.min(Math.round((fondo.raised / fondo.meta) * 100), 100) : null
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all space-y-3 ${
        selected ? 'border-blue-700 bg-blue-50/60 shadow-md' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-sm text-slate-900 uppercase tracking-wide leading-tight">{fondo.title}</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{fondo.desc}</p>
        </div>
      </div>
      {pct !== null && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>₡{fondo.raised.toLocaleString('es-CR')} recaudados</span>
            <span className="text-blue-700">{pct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <ProgressFill value={pct} />
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{fondo.donors} donantes · Meta: ₡{fondo.meta.toLocaleString('es-CR')}</p>
        </div>
      )}
    </button>
  )
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
export default function DonationsPage() {
  const { user } = useProfile()
  const isAdmin = user?.user_metadata?.rol === 'admin' || user?.user_metadata?.tipo === 'admin'
  const [form, setForm] = useState<FormDonacion>(INITIAL_FORM)
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [comprobanteError, setComprobanteError] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  
  const [step, setStep] = useState<number>(1);
  const searchParams = useSearchParams();
  useEffect(() => {
    const metodo = searchParams.get('metodo');
    if (metodo === 'sinpe') {
      setForm(p => ({ ...p, metodo: 'sinpe' }));
      setStep(2);
    }
  }, [searchParams]);
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const progress = Math.round((step / 4) * 100)

  const update = (k: keyof FormDonacion, v: string) => setForm(p => ({ ...p, [k]: v }))

  const fondoSeleccionado = FONDOS.find(f => f.id === form.fondo_id)

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white flex items-center justify-center py-12 px-6">
        <div className="text-center space-y-5 max-w-md mx-auto">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase font-display tracking-wide">Acceso Denegado</h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Los administradores no pueden realizar donaciones desde esta cuenta. Si deseas donar, por favor ingresa con una cuenta de exalumno.
          </p>
          <div className="flex justify-center pt-4">
            <Link href="/dashboard">
              <Button variant="primary" className="bg-blue-700 hover:bg-blue-800 font-bold uppercase tracking-wider text-xs px-6 py-3 shadow-md">
                Ir al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // --- Archivo comprobante ---
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setComprobanteError('El archivo supera el máximo de 5MB.'); return }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) { setComprobanteError('Solo se permiten JPG, PNG, WEBP o PDF.'); return }
    setComprobanteError('')
    setComprobante(file)
  }

  // --- Navegación ---
  const nextStep = () => {
    const errs: string[] = []
    if (step === 1) {
      if (!form.fondo_id) errs.push('Selecciona un fondo destino.')
    } else if (step === 2) {
      if (!form.monto || Number(form.monto) <= 0) errs.push('Ingresa un monto válido mayor a 0.')
      if (!form.metodo) errs.push('Selecciona un método de pago.')
    } else if (step === 3) {
      // no validation to move from instructions to comprobante
    }
    
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setErrors([])
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setErrors([])
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmarDonacion = async () => {
    const errs: string[] = []
    if (!form.fecha_transferencia) errs.push('Ingresa la fecha y hora de la transferencia.')
    if (!comprobante) errs.push('Adjunta el comprobante de pago (obligatorio).')
    
    if (errs.length > 0) {
      setErrors(errs)
      return
    }

    setIsSaving(true)
    setErrors([])
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No estás autenticado.")

      // 1. Subir comprobante a Supabase Storage
      const fileExt = comprobante!.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_comprobante.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, comprobante!)
        
      if (uploadError) throw new Error("Error al subir comprobante: " + uploadError.message)
      
      const comprobantePath = uploadData.path

      const mappedMetodo = form.metodo === 'sinpe' ? 'SINPE' : 'Transferencia'

      await crearDonacion({
        proyecto_destino: form.fondo_id,
        monto: Number(form.monto),
        moneda: form.moneda,
        metodo_pago: mappedMetodo,
        fecha_transferencia: new Date(form.fecha_transferencia).toISOString(),
        numero_referencia: form.numero_referencia || '',
        comprobante_url: comprobantePath,
        mensaje_estudiante: form.mensaje || undefined
      })

      setSaved(true)
    } catch (err: any) {
      console.error(err)
      setErrors([err.message || 'Ocurrió un error inesperado'])
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================
  // PANTALLA DE ÉXITO
  // ============================================================
  if (saved) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white flex items-center justify-center py-12 px-6">
        <div className="text-center space-y-5 max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase font-display tracking-wide">¡Donación Registrada!</h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left space-y-2 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Resumen</p>
            <p className="text-sm font-bold text-slate-800">{fondoSeleccionado?.title}</p>
            <p className="text-lg font-black text-blue-700">{formatCurrency(Number(form.monto), form.moneda)}</p>
            <div className="flex items-center gap-2 text-xs text-amber-700 font-bold bg-amber-50 border border-amber-100 rounded-xl p-3 mt-2">
              <Clock className="w-4 h-4 shrink-0" />
              Estado: <span className="uppercase tracking-wide">Pendiente de Confirmación</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            El equipo de la Fundación revisará tu comprobante en un plazo máximo de <strong>48 horas hábiles</strong>. 
            Recibirás un correo con la confirmación.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/donations/history">
              <Button variant="secondary" className="font-bold uppercase tracking-wider text-xs px-5">Ver mi historial</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" className="bg-blue-700 hover:bg-blue-800 font-bold uppercase tracking-wider text-xs px-5">Ir al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER DE PASOS
  // ============================================================
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-3">1. Elige el fondo destino</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FONDOS.map(f => (
                <FondoCard
                  key={f.id}
                  fondo={f}
                  selected={form.fondo_id === f.id}
                  onSelect={() => update('fondo_id', f.id)}
                />
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-3">2. Monto y Método de Pago</h2>
            
            <div className="grid grid-cols-3 gap-4 max-w-md">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Monto <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={form.monto}
                  onChange={e => update('monto', e.target.value)}
                  placeholder="Ej: 25000"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
                />
              </div>
              <div>
                <label htmlFor="moneda" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Moneda <span className="text-rose-500">*</span></label>
                <select
                  id="moneda"
                  value={form.moneda}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('moneda', e.target.value as 'CRC' | 'USD')}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
                >
                  <option value="CRC">₡ CRC</option>
                  <option value="USD">$ USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Método de Pago <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                {Object.entries(INSTRUCCIONES_PAGO).map(([key, m]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update('metodo', key)}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all text-left ${
                      form.metodo === key ? 'border-blue-700 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'
                    }`}
                  >
                    <div className={`shrink-0 ${form.metodo === key ? 'text-blue-700' : 'text-slate-400'}`}>{m.icon}</div>
                    <span className={`text-xs font-bold uppercase tracking-wide ${form.metodo === key ? 'text-blue-700' : 'text-slate-600'}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      case 3: {
        const metodo = INSTRUCCIONES_PAGO[form.metodo as MetodoPago]
        const ref = form.numero_referencia || `UCR-${Date.now().toString().slice(-6)}`
        return (
          <div className="space-y-6">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-3">3. Instrucciones de Pago</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card hoverEffect={false} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Resumen de Donación a:</h3>
                <p className="font-display font-extrabold text-slate-900 text-base uppercase tracking-wide">{fondoSeleccionado?.title}</p>
                <p className="text-2xl font-black text-blue-700">{formatCurrency(Number(form.monto), form.moneda)}</p>
              </Card>

              <Card hoverEffect={false} className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0">
                    {metodo?.icon}
                  </div>
                  <h3 className="font-display font-extrabold text-slate-900 uppercase tracking-wide text-sm">{metodo?.label}</h3>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-1 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold">{metodo?.linea1}</p>
                  <p className="text-xl font-black text-slate-900 font-mono">{metodo?.linea2}</p>
                  <p className="text-xs text-slate-600 font-semibold">{metodo?.linea3}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />Número de referencia a incluir (opcional):</p>
                  <p className="font-mono font-black text-blue-900 text-lg">{ref}</p>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{metodo?.detalle}</p>
              </Card>
            </div>
          </div>
        )
      }
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-3">4. Comprobante de Donación</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="fecha-transferencia" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fecha y Hora de Transferencia <span className="text-rose-500">*</span></label>
                  <input
                    id="fecha-transferencia"
                    type="datetime-local"
                    value={form.fecha_transferencia}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('fecha_transferencia', e.target.value)}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="numero-referencia" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Número de Referencia <span className="text-slate-400 font-normal normal-case">(opcional)</span></label>
                  <input
                    id="numero-referencia"
                    type="text"
                    value={form.numero_referencia}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('numero_referencia', e.target.value)}
                    placeholder="Número que aparece en el comprobante"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mensaje para el estudiante <span className="text-slate-400 font-normal normal-case">(opcional)</span>
                  </label>
                  <textarea
                    value={form.mensaje}
                    onChange={e => update('mensaje', e.target.value)}
                    maxLength={300}
                    rows={3}
                    placeholder="Escribe unas palabras de motivación..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all resize-none"
                  />
                  <p className="text-[10px] text-slate-400 text-right mt-0.5">{form.mensaje.length}/300</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Comprobante de Pago <span className="text-rose-500">*</span>
                  <span className="text-slate-400 font-normal normal-case ml-1">(JPG, PNG o PDF, máx. 5MB)</span>
                </label>
                {!comprobante ? (
                  <label className="flex flex-col items-center justify-center gap-3 h-32 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl bg-slate-50 cursor-pointer transition-all group">
                    <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-wide">Haz clic o arrastra aquí tu comprobante</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={handleFile} />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-800 truncate">{comprobante.name}</p>
                      <p className="text-[10px] text-emerald-600">{(comprobante.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" aria-label="Quitar comprobante" onClick={() => setComprobante(null)} className="text-emerald-500 hover:text-rose-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {comprobanteError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{comprobanteError}</p>
                )}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-8 px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">Donaciones</h1>
            <p className="text-sm text-slate-700 font-medium">Apoya directamente a la permanencia y el desarrollo de estudiantes de la UCR.</p>
          </div>
          <Link href="/donations/history">
            <Button variant="secondary" className="border-blue-700 text-blue-700 hover:bg-blue-50 font-bold uppercase tracking-wider text-xs px-5 flex items-center gap-2">
              <History className="w-4 h-4" />Ver mi historial
            </Button>
          </Link>
        </div>

        {/* Barra de Progreso */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Progreso de la Donación</span>
            <span className="text-xs font-black text-blue-700">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <ProgressFill value={progress} />
          </div>
          {/* Indicadores de pasos */}
          <div className="flex items-center justify-between">
            {STEPS.map(({ id, label, icon: Icon }) => (
              <div key={id} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  step === id ? 'bg-blue-700 text-white shadow-md' :
                  step > id ? 'bg-emerald-500 text-white' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {step > id ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wide hidden sm:block ${step === id ? 'text-blue-700' : step > id ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Errores de validación */}
        {errors.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-1">
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{e}
              </p>
            ))}
          </div>
        )}

        {/* Formulario */}
        <Card hoverEffect={false} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          {renderStep()}
        </Card>

        {/* Navegación */}
        <div className="flex items-center justify-between pb-8">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={step === 1 || isSaving}
            className="font-bold uppercase tracking-wider text-xs px-5"
          >
            ← Atrás
          </Button>

          {step < STEPS.length ? (
            <Button
              variant="primary"
              onClick={nextStep}
              className="bg-blue-700 hover:bg-blue-800 font-bold uppercase tracking-wider text-xs px-6"
            >
              Continuar →
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={confirmarDonacion}
              isLoading={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-wider text-xs px-6"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmar Donación
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
