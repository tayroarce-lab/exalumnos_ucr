'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { crearDonacion } from '@/actions/donaciones'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import {
  Upload, AlertCircle, Heart, DollarSign, Calendar,
  CreditCard, CheckCircle2, Copy, FileText
} from 'lucide-react'

// Dummy info para el diseño
const INFO_SINPE = '8888-8888' // Fundación UCR
const INFO_IBAN = 'CR12015201001000123456' // Fundación UCR

export default function DonarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  // File states
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')

  const [form, setForm] = useState({
    proyecto_destino: 'Fondo general',
    monto: '',
    moneda: 'CRC',
    metodo_pago: 'SINPE',
    fecha_transferencia: '',
    numero_referencia: '',
    mensaje_estudiante: ''
  })

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      const { data } = await supabase.from('profiles').select('es_exalumno').eq('id', user.id).single()
      if (!data?.es_exalumno) {
        router.push('/')
        return
      }
      setLoading(false)
    }
    checkAccess()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    setFileError('')
    if (!selected) {
      setFile(null)
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFileError('El archivo no puede pesar más de 5MB')
      setFile(null)
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(selected.type)) {
      setFileError('Solo se permiten imágenes (JPG, PNG) o PDF')
      setFile(null)
      return
    }
    setFile(selected)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copiado al portapapeles: ' + text)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    
    // Validation
    const errs = []
    if (!form.monto || Number(form.monto) <= 0) errs.push('Ingrese un monto válido')
    if (!form.fecha_transferencia) errs.push('Seleccione la fecha y hora de la transferencia')
    if (!file) errs.push('Debe adjuntar el comprobante de pago')
    
    if (errs.length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuario no autenticado')

      // 1. Upload File
      const fileExt = file!.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(fileName, file!)

      if (uploadError) throw new Error('Error al subir comprobante: ' + uploadError.message)
      
      const { data: { publicUrl } } = supabase.storage.from('comprobantes').getPublicUrl(fileName)
      // Since it's a private bucket, getPublicUrl might not work for direct public viewing,
      // but we store the path/name or use a signed url for admin.
      // Actually we just store the path so admin can download it via supabase storage api.
      const filePath = fileName // Storing just the path to use with download later

      // 2. Insert record
      await crearDonacion({
        proyecto_destino: form.proyecto_destino,
        monto: Number(form.monto),
        moneda: form.moneda as 'CRC' | 'USD',
        metodo_pago: form.metodo_pago as 'SINPE' | 'Transferencia',
        fecha_transferencia: new Date(form.fecha_transferencia).toISOString(),
        numero_referencia: form.numero_referencia,
        comprobante_url: filePath,
        mensaje_estudiante: form.mensaje_estudiante || undefined
      })

      setSuccess(true)
    } catch (err: any) {
      setErrors([err.message || 'Ocurrió un error al procesar la donación'])
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-medium">Verificando acceso...</div>
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] py-12 px-6">
        <Card hoverEffect={false} className="w-full max-w-lg text-center space-y-5 p-10 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-emerald-600 fill-emerald-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase font-display tracking-tight">¡Gracias por tu apoyo!</h2>
          <p className="text-base text-slate-600 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
            Tu donación fue registrada. El equipo UCR la revisará en las próximas 48 horas hábiles.
          </p>
          <div className="pt-6">
            <Button onClick={() => router.push('/give-back/historial')} className="w-full bg-institutional hover:bg-institutional-hover text-white h-12 text-sm font-bold tracking-wide uppercase rounded-xl">
              Ver mis donaciones
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-6 lg:px-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pt-2 space-y-2 text-center max-w-2xl mx-auto mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-blue-700" />
          </div>
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">Realizar Donación</h1>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Tu aporte hace la diferencia para un estudiante de la UCR. Completa el formulario y adjunta el comprobante de pago.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2 mb-6">
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />{e}
              </p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8">
          
          {/* Destino */}
          <div>
            <label htmlFor="proyecto_destino" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Proyecto Destino <span className="text-rose-500">*</span></label>
            <select
              id="proyecto_destino"
              value={form.proyecto_destino}
              onChange={e => setForm({...form, proyecto_destino: e.target.value})}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
            >
              <option value="Fondo general">Fondo general</option>
              <option value="Becas Ingeniería">Becas Ingeniería</option>
              <option value="Proyectos TFG">Proyectos de Graduación (TFG)</option>
            </select>
          </div>

          {/* Monto y Moneda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="monto_donacion" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Monto <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{form.moneda === 'CRC' ? '₡' : '$'}</span>
                <input
                  id="monto_donacion"
                  type="number" min="1" step="0.01"
                  value={form.monto}
                  onChange={e => setForm({...form, monto: e.target.value})}
                  placeholder="0.00"
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="moneda_donacion" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Moneda <span className="text-rose-500">*</span></label>
              <select
                id="moneda_donacion"
                value={form.moneda}
                onChange={e => setForm({...form, moneda: e.target.value})}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
              >
                <option value="CRC">CRC - Colones</option>
                <option value="USD">USD - Dólares</option>
              </select>
            </div>
          </div>

          {/* Método de Pago y Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
            <div>
              <label htmlFor="metodo_pago" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Método de Pago <span className="text-rose-500">*</span></label>
              <select
                id="metodo_pago"
                value={form.metodo_pago}
                onChange={e => setForm({...form, metodo_pago: e.target.value})}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
              >
                <option value="SINPE">SINPE Móvil</option>
                <option value="Transferencia">Transferencia Bancaria (IBAN)</option>
              </select>
            </div>
            <div>
              <label htmlFor="fecha_transferencia" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Fecha y Hora de la Transferencia <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="fecha_transferencia"
                  type="datetime-local"
                  value={form.fecha_transferencia}
                  onChange={e => setForm({...form, fecha_transferencia: e.target.value})}
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                />
              </div>
            </div>
          </div>

          {/* Instrucciones Dinámicas */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-2 animate-fade-in">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">Instrucciones de Pago</p>
            {form.metodo_pago === 'SINPE' ? (
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-medium mb-1">Teléfono SINPE Fundación UCR</span>
                  <span className="font-mono font-bold text-lg text-slate-900">{INFO_SINPE}</span>
                </div>
                <Button type="button" variant="secondary" onClick={() => handleCopy(INFO_SINPE)} className="gap-2 h-9">
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-medium mb-1">Cuenta IBAN Fundación UCR</span>
                  <span className="font-mono font-bold text-sm text-slate-900">{INFO_IBAN}</span>
                </div>
                <Button type="button" variant="secondary" onClick={() => handleCopy(INFO_IBAN)} className="gap-2 h-9">
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </Button>
              </div>
            )}
          </div>

          {/* Ref y File */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
            <div>
              <label htmlFor="numero_referencia" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Número de Referencia <span className="text-slate-400 font-normal normal-case">(Opcional)</span></label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="numero_referencia"
                  type="text"
                  value={form.numero_referencia}
                  onChange={e => setForm({...form, numero_referencia: e.target.value})}
                  placeholder="Ej: 123456789"
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="comprobante_file" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Comprobante (Máx 5MB) <span className="text-rose-500">*</span></label>
              <label className={`flex items-center gap-3 px-4 h-12 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'}`}>
                {file ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Upload className="w-5 h-5 text-slate-400" />}
                <span className={`text-sm font-semibold truncate ${file ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {file ? file.name : 'Subir imagen o PDF'}
                </span>
                <input id="comprobante_file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
              {fileError && <p className="text-xs text-rose-600 font-bold mt-2">{fileError}</p>}
            </div>
          </div>

          {/* Mensaje */}
          <div className="pt-4 border-t border-slate-100">
            <label htmlFor="mensaje_estudiante" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mensaje para el estudiante <span className="text-slate-400 font-normal normal-case">(Opcional)</span></label>
            <textarea
              id="mensaje_estudiante"
              value={form.mensaje_estudiante}
              onChange={e => setForm({...form, mensaje_estudiante: e.target.value})}
              placeholder="Puedes dejar un mensaje de apoyo (máx. 300 caracteres)..."
              maxLength={300}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 resize-none placeholder:text-slate-400"
            />
            <p className="text-[10px] text-slate-400 font-bold text-right mt-1">{form.mensaje_estudiante.length}/300 caracteres</p>
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-14 bg-institutional hover:bg-institutional-hover text-white rounded-xl shadow-md font-extrabold uppercase tracking-widest text-sm">
            {submitting ? 'Procesando...' : 'Enviar Donación'}
          </Button>
        </form>
      </div>
    </div>
  )
}
