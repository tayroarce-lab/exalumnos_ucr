'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, User, GraduationCap, FileText, Heart, Handshake, Upload, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { actualizarPerfilCompletoEstudiante } from '@/actions/students'
import { useProfile } from '@/contexts/ProfileContext'
import {
  CARRERAS_UCR,
  ESCUELAS_UCR,
  AREAS_INTERES,
  TIPOS_APOYO,
  CARRERA_TO_ESCUELA,
} from '@/constants/catalogs'

const sedes = ['Sede Rodrigo Facio', 'Sede de Occidente', 'Sede del Atlántico', 'Sede de Guanacaste', 'Sede del Pacífico', 'Sede Interuniversitaria de Alajuela', 'Sede del Sur']
const necesidadesOpciones = ['Financiamiento', 'Mentoría técnica', 'Acceso a datos', 'Infraestructura', 'Validación empresarial', 'Empleo paralelo']

const STEPS = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Académica', icon: GraduationCap },
  { id: 3, label: 'Proyecto', icon: FileText },
  { id: 4, label: 'Intereses', icon: Heart },
  { id: 5, label: 'Apoyo', icon: Handshake },
]

export type CombinedStudentFormData = {
  // Personal (profiles)
  full_name: string
  foto_url: string
  pais_ciudad: string
  linkedin_url: string
  bio: string
  
  // Académica (estudiantes)
  carrera: string
  escuela_facultad: string
  sede: string
  anio_ingreso: number
  
  // Proyecto (estudiantes)
  proyecto_titulo: string
  proyecto_descripcion: string
  proyecto_area_tematica: string
  proyecto_tipo: string
  proyecto_porcentaje_avance: number
  proyecto_valor_monto: number | null
  proyecto_valor_moneda: string | null
  proyecto_video_url: string | null
  proyecto_documento_url: string | null
  proyecto_necesidades: string[]
  
  // Intereses (estudiantes)
  areas_de_interes: string[]
  
  // Apoyo (users)
  busca_financiamiento: boolean
  busca_mentoria: boolean
  busca_empleo: boolean
  busca_pasantia: boolean
}

export default function StudentProfileEdit() {
  const router = useRouter()
  const { profile: userProfile, isLoading: isProfileLoading, refreshProfile } = useProfile()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CombinedStudentFormData | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (isProfileLoading) return
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        let estData: any = {}
        let usersData: any = {}
        
        // Fetch estudiantes and users
        const { data, error } = await supabase
          .from('users')
          .select('*, estudiantes(*)')
          .eq('id', user.id)
          .single()

        if (data) {
          usersData = data
          estData = Array.isArray(data.estudiantes) ? data.estudiantes[0] || {} : data.estudiantes || {}
        }

        setFormData({
          full_name: userProfile?.full_name || '',
          foto_url: userProfile?.foto_url || '',
          pais_ciudad: userProfile?.pais_ciudad || '',
          linkedin_url: userProfile?.linkedin_url || '',
          bio: userProfile?.bio || '',
          
          carrera: estData.carrera || '',
          escuela_facultad: estData.escuela_facultad || '',
          sede: estData.sede || '',
          anio_ingreso: estData.anio_ingreso || new Date().getFullYear(),
          
          proyecto_titulo: estData.proyecto_titulo || '',
          proyecto_descripcion: estData.proyecto_descripcion || '',
          proyecto_area_tematica: estData.proyecto_area_tematica || '',
          proyecto_tipo: estData.proyecto_tipo || 'tfg',
          proyecto_porcentaje_avance: estData.proyecto_porcentaje_avance || 0,
          proyecto_valor_monto: estData.proyecto_valor_monto || null,
          proyecto_valor_moneda: estData.proyecto_valor_moneda || 'CRC',
          proyecto_video_url: estData.proyecto_video_url || '',
          proyecto_documento_url: estData.proyecto_documento_url || '',
          proyecto_necesidades: estData.proyecto_necesidades || [],
          
          areas_de_interes: estData.areas_de_interes || [],
          
          busca_financiamiento: usersData.busca_financiamiento || false,
          busca_mentoria: usersData.busca_mentoria || false,
          busca_empleo: usersData.busca_empleo || false,
          busca_pasantia: usersData.busca_pasantia || false,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [userProfile, isProfileLoading])

  if (isLoading || !formData) {
    return <div className="p-8 text-center text-slate-500 font-medium">Cargando perfil de estudiante...</div>
  }

  const update = (k: keyof CombinedStudentFormData, v: any) => {
    setFormData(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'carrera' && CARRERA_TO_ESCUELA[v as string]) {
        next.escuela_facultad = CARRERA_TO_ESCUELA[v as string]
      }
      return next
    })
  }

  const handleCheckboxArray = (name: 'proyecto_necesidades' | 'areas_de_interes', value: string) => {
    setFormData(prev => {
      const arr = prev[name]
      if (arr.includes(value)) {
        return { ...prev, [name]: arr.filter(item => item !== value) }
      } else {
        return { ...prev, [name]: [...arr, value] }
      }
    })
  }

  const validateStep = (s: number): string[] => {
    const errs: string[] = []
    if (s === 1) {
      if (!formData.full_name.trim()) errs.push('El nombre es obligatorio.')
      if (!formData.pais_ciudad.trim()) errs.push('País y ciudad son obligatorios.')
      if (!formData.bio.trim()) errs.push('La biografía es obligatoria.')
    }
    if (s === 2) {
      if (!formData.carrera) errs.push('La carrera es obligatoria.')
      if (!formData.escuela_facultad) errs.push('La escuela/facultad es obligatoria.')
      if (!formData.sede) errs.push('La sede es obligatoria.')
    }
    if (s === 3) {
      if (!formData.proyecto_titulo.trim()) errs.push('El título del proyecto es obligatorio.')
      if (!formData.proyecto_descripcion.trim()) errs.push('La descripción del proyecto es obligatoria.')
      if (!formData.proyecto_area_tematica) errs.push('El área temática es obligatoria.')
      if (formData.proyecto_necesidades.length === 0) errs.push('Selecciona al menos una necesidad del proyecto.')
    }
    if (s === 4) {
      if (formData.areas_de_interes.length === 0) errs.push('Selecciona al menos un área de interés.')
    }
    return errs
  }

  const goNext = () => {
    const errs = validateStep(step)
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setStep(s => Math.min(s + 1, STEPS.length))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    const errs = validateStep(step)
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setIsSubmitting(true)
    try {
      const res = await actualizarPerfilCompletoEstudiante(formData)
      if (res && res.success === false) {
        setErrors([res.error || 'Error al guardar el perfil'])
        return
      }
      await refreshProfile()
      router.push('/profile')
      router.refresh()
    } catch (error: any) {
      setErrors([error.message || 'Error al guardar el perfil'])
    } finally {
      setIsSubmitting(false)
    }
  }

  // File Upload Logic
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(['El archivo debe ser una imagen.'])
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(['La imagen no debe pesar más de 2MB.'])
      return
    }

    try {
      setUploadingImage(true)
      setErrors([])
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const ext = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      update('foto_url', data.publicUrl)
    } catch (err: any) {
      setErrors([err.message || 'Error al subir la imagen.'])
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* STEPS HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm overflow-hidden relative">
        <div className="flex justify-between items-center relative z-10">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            const isActive = s.id === step
            const isCompleted = s.id < step
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 font-bold text-sm shadow-sm ${
                  isActive ? 'bg-institutional text-white scale-110 shadow-institutional/30' :
                  isCompleted ? 'bg-institutional/10 text-institutional' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block transition-colors ${
                  isActive ? 'text-institutional' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-lg text-sm font-medium space-y-1">
          {errors.map((e, i) => <p key={i} className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{e}</p>)}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Información Personal</h3>
            
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-32 h-32 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 overflow-hidden relative group">
                {formData.foto_url ? (
                  <img src={formData.foto_url} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl text-slate-400 font-bold">{formData.full_name ? formData.full_name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}</div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer text-white flex flex-col items-center gap-1">
                    <Upload className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Subir</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
                {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-5 h-5 border-2 border-institutional border-t-transparent rounded-full animate-spin" /></div>}
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nombre Completo <span className="text-rose-500">*</span></label>
                  <input type="text" value={formData.full_name} onChange={e => update('full_name', e.target.value)} className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">País y Ciudad de Residencia <span className="text-rose-500">*</span></label>
                  <input type="text" value={formData.pais_ciudad} onChange={e => update('pais_ciudad', e.target.value)} placeholder="Ej: San José, Costa Rica" className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">URL de LinkedIn</label>
                  <input type="text" value={formData.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Sobre Mí (Biografía) <span className="text-rose-500">*</span></label>
              <textarea value={formData.bio} onChange={e => update('bio', e.target.value)} rows={4} maxLength={500} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none resize-none" placeholder="Cuenta un poco sobre ti, tus aspiraciones..." />
              <p className="text-[10px] text-slate-400 text-right mt-1">{formData.bio.length}/500 caracteres</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Información Académica</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Carrera <span className="text-rose-500">*</span></label>
              <select value={formData.carrera} onChange={e => update('carrera', e.target.value)} className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none bg-white">
                <option value="">Seleccione una carrera</option>
                {/* Si el valor guardado no está en el catálogo, lo mostramos igual */}
                {formData.carrera && !CARRERAS_UCR.includes(formData.carrera) && (
                  <option value={formData.carrera}>{formData.carrera}</option>
                )}
                {CARRERAS_UCR.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Facultad / Escuela <span className="text-rose-500">*</span></label>
              <select value={formData.escuela_facultad} onChange={e => update('escuela_facultad', e.target.value)} className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none bg-white">
                <option value="">Seleccione una facultad</option>
                {/* Si el valor guardado no está en el catálogo, lo mostramos igual */}
                {formData.escuela_facultad && !ESCUELAS_UCR.includes(formData.escuela_facultad) && (
                  <option value={formData.escuela_facultad}>{formData.escuela_facultad}</option>
                )}
                {ESCUELAS_UCR.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Sede UCR <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select value={formData.sede} onChange={e => update('sede', e.target.value)} className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none bg-white appearance-none">
                  <option value="">Seleccione una sede</option>
                  {/* Si el valor guardado no está en el catálogo, lo mostramos igual */}
                  {formData.sede && !sedes.includes(formData.sede) && (
                    <option value={formData.sede}>{formData.sede}</option>
                  )}
                  {sedes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Año de Ingreso <span className="text-rose-500">*</span></label>
              <input type="number" value={formData.anio_ingreso} onChange={e => update('anio_ingreso', Number(e.target.value))} min="1950" max={new Date().getFullYear()} className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none bg-white" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Proyecto de Graduación</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Título del Proyecto <span className="text-rose-500">*</span></label>
              <input type="text" value={formData.proyecto_titulo} onChange={e => update('proyecto_titulo', e.target.value)} maxLength={200} className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tipo de Proyecto <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select value={formData.proyecto_tipo} onChange={e => update('proyecto_tipo', e.target.value)} className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none bg-white appearance-none">
                    <option value="tfg">TFG</option>
                    <option value="tesis">Tesis</option>
                    <option value="practica_dirigida">Práctica Dirigida</option>
                    <option value="seminario">Seminario</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Área Temática Principal <span className="text-rose-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {AREAS_INTERES.map(area => {
                  const isSelected = formData.proyecto_area_tematica === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => update('proyecto_area_tematica', isSelected ? '' : area)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all border ${
                        isSelected
                          ? 'bg-institutional text-white border-institutional shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-institutional/50 hover:text-institutional'
                      }`}
                    >
                      {isSelected && '✓ '}{area}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Porcentaje de Avance ({formData.proyecto_porcentaje_avance}%) <span className="text-rose-500">*</span></label>
              <input type="range" value={formData.proyecto_porcentaje_avance} onChange={e => update('proyecto_porcentaje_avance', Number(e.target.value))} min="0" max="100" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-institutional" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Descripción del Proyecto <span className="text-rose-500">*</span></label>
              <textarea value={formData.proyecto_descripcion} onChange={e => update('proyecto_descripcion', e.target.value)} maxLength={1000} rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none resize-none" placeholder="Describe brevemente de qué trata tu proyecto..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Valor Monetario / Costo</label>
                <div className="flex gap-2">
                  <div className="relative w-24 shrink-0">
                    <select value={formData.proyecto_valor_moneda || 'CRC'} onChange={e => update('proyecto_valor_moneda', e.target.value)} className="w-full h-11 px-4 pr-8 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none bg-white appearance-none">
                      <option value="CRC">CRC</option>
                      <option value="USD">USD</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                  <input type="number" value={formData.proyecto_valor_monto || ''} onChange={e => update('proyecto_valor_monto', e.target.value ? Number(e.target.value) : null)} placeholder="Ej: 150000" className="flex-1 h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Enlace del Video Explicativo</label>
                <input type="url" value={formData.proyecto_video_url || ''} onChange={e => update('proyecto_video_url', e.target.value)} placeholder="Ej: https://youtube.com/watch?v=..." className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none" />
                <p className="text-[10px] text-slate-500 mt-1">Pega un enlace de YouTube o Vimeo para mostrarlo en tu perfil.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Enlace al Documento (PDF/Drive)</label>
                <input type="url" value={formData.proyecto_documento_url || ''} onChange={e => update('proyecto_documento_url', e.target.value)} placeholder="Ej: https://drive.google.com/file/d/..." className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-institutional focus:ring-1 focus:ring-institutional outline-none" />
                <p className="text-[10px] text-slate-500 mt-1">Enlace para descargar tu presentación o reporte.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Necesidades del Proyecto (Selecciona al menos una) <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {necesidadesOpciones.map(nec => (
                  <label key={nec} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${formData.proyecto_necesidades.includes(nec) ? 'bg-institutional/5 border-institutional' : 'hover:bg-slate-50 border-slate-200'}`}>
                    <input type="checkbox" checked={formData.proyecto_necesidades.includes(nec)} onChange={() => handleCheckboxArray('proyecto_necesidades', nec)} className="w-4 h-4 text-institutional rounded focus:ring-institutional" />
                    <span className="ml-3 text-sm text-slate-700">{nec}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Áreas de Interés</h3>
            <p className="text-xs text-slate-500">Selecciona las áreas temáticas con las que se relaciona tu perfil y tu proyecto.</p>
            <div className="flex flex-wrap gap-2">
              {AREAS_INTERES.map(area => {
                const isSelected = formData.areas_de_interes.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        update('areas_de_interes', formData.areas_de_interes.filter(a => a !== area))
                      } else {
                        update('areas_de_interes', [...formData.areas_de_interes, area])
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all border ${
                      isSelected
                        ? 'bg-institutional text-white border-institutional shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-institutional/50 hover:text-institutional'
                    }`}
                  >
                    {isSelected && '✓ '}{area}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Apoyo Buscado</h3>
            <div className="space-y-3">
              {[
                { name: 'busca_financiamiento', label: '¿Buscas financiamiento económico para tu proyecto?' },
                { name: 'busca_mentoria', label: '¿Buscas mentoría técnica o profesional?' },
                { name: 'busca_empleo', label: '¿Buscas empleo mientras estudias o al graduarte?' },
                { name: 'busca_pasantia', label: '¿Buscas pasantía relacionada a tu carrera?' },
              ].map(item => (
                <label key={item.name} className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-colors ${formData[item.name as keyof CombinedStudentFormData] ? 'border-institutional bg-institutional/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  <input type="checkbox" checked={formData[item.name as keyof CombinedStudentFormData] as boolean} onChange={e => update(item.name as keyof CombinedStudentFormData, e.target.checked)} className="w-5 h-5 accent-institutional" />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <button type="button" onClick={() => { setErrors([]); setStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={step === 1} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors ${step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
            <ArrowLeft className="w-4 h-4" /> Anterior
          </button>
          
          {step === STEPS.length ? (
            <button type="button" onClick={handleSave} disabled={isSubmitting} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white transition-all shadow-sm ${isSubmitting ? 'bg-institutional/50 cursor-wait' : 'bg-institutional hover:bg-institutional/90 hover:scale-105 active:scale-95'}`}>
              {isSubmitting ? 'Guardando...' : 'Guardar Perfil'}
              {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
            </button>
          ) : (
            <button type="button" onClick={goNext} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs bg-institutional text-white transition-all shadow-sm hover:bg-institutional/90 hover:scale-105 active:scale-95">
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
