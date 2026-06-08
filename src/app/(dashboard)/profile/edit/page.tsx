'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  User, GraduationCap, Briefcase, Heart, Handshake,
  ArrowLeft, ArrowRight, CheckCircle2, Upload, X, AlertCircle, ChevronDown
} from 'lucide-react'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import {
  CARRERAS_UCR,
  ESCUELAS_UCR,
  SECTORES_INDUSTRIA,
  AREAS_INTERES,
  TIPOS_APOYO,
  CARRERA_TO_ESCUELA,
} from '@/constants/catalogs'

// Barra de progreso dinámica sin estilos inline en JSX
function ProgressFill({ value, colorClass = 'bg-institutional' }: { value: number; colorClass?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.width = `${value}%`
    }
  }, [value])
  return <div ref={ref} className={`h-2 rounded-full transition-all duration-500 ${colorClass}`} />
}

// ============================================================
// TIPOS
// ============================================================
interface AcademicEntry {
  carrera: string
  escuela: string
  anio: string
}

interface ProfileFormData {
  // Sección 1 - Personal
  foto_url: string
  pais_ciudad: string
  linkedin_url: string
  bio: string
  // Sección 2 - Académica
  academic: AcademicEntry[]
  // Sección 3 - Profesional
  empresa_actual: string
  cargo_actual: string
  sector_industria: string[]
  anos_experiencia: string
  // Sección 4 - Áreas de Interés
  areas_de_interes: string[]
  // Sección 5 - Tipo de Apoyo
  ofrece_mentoria: boolean
  horas_mes_mentoria: string
  ofrece_empleo: boolean
  ofrece_pasantia: boolean
  ofrece_proyecto: boolean
  ofrece_donacion_dinero: boolean
  monto_maximo_donacion: string
  moneda_donacion: 'CRC' | 'USD'
}

const INITIAL: ProfileFormData = {
  foto_url: '',
  pais_ciudad: '',
  linkedin_url: '',
  bio: '',
  academic: [{ carrera: '', escuela: '', anio: '' }],
  empresa_actual: '',
  cargo_actual: '',
  sector_industria: [],
  anos_experiencia: '',
  areas_de_interes: [],
  ofrece_mentoria: false,
  horas_mes_mentoria: '',
  ofrece_empleo: false,
  ofrece_pasantia: false,
  ofrece_proyecto: false,
  ofrece_donacion_dinero: false,
  monto_maximo_donacion: '',
  moneda_donacion: 'CRC',
}

const STEPS = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Académica', icon: GraduationCap },
  { id: 3, label: 'Profesional', icon: Briefcase },
  { id: 4, label: 'Intereses', icon: Heart },
  { id: 5, label: 'Apoyo', icon: Handshake },
]

// ============================================================
// COMPONENTES DE APOYO
// ============================================================

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  )
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="flex items-center gap-1 text-xs text-rose-600 font-semibold mt-1.5"><AlertCircle className="w-3 h-3" />{msg}</p>
}

function TextInput({ label, required, value, onChange, placeholder, type = 'text', max }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; max?: number
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={max}
        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all placeholder:text-slate-400"
      />
      {max && <p className="text-[10px] text-slate-400 text-right mt-1">{value.length}/{max} caracteres</p>}
    </div>
  )
}

function TextAreaInput({ label, required, value, onChange, placeholder, max }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void
  placeholder?: string; max?: number
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={max}
        rows={4}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all placeholder:text-slate-400 resize-none"
      />
      {max && <p className="text-[10px] text-slate-400 text-right mt-1">{value.length}/{max} caracteres</p>}
    </div>
  )
}

function SelectInput({ label, required, value, onChange, options, placeholder }: {
  label: string; required?: boolean; value: string
  onChange: (v: string) => void; options: string[]; placeholder?: string
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none"
      >
        <option value="">{placeholder || 'Seleccionar…'}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  )
}

function MultiSelectChips({ label, required, selected, options, onChange, max }: {
  label: string; required?: boolean; selected: string[]; options: string[]
  onChange: (v: string[]) => void; max?: number
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt))
    } else if (!max || selected.length < max) {
      onChange([...selected, opt])
    }
  }
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      {max && <p className="text-[10px] text-slate-400 mb-2">Selecciona hasta {max} opciones ({selected.length} seleccionadas)</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isSelected = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all border ${
                isSelected
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-700'
              }`}
            >
              {isSelected && '✓ '}{opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// SECCIONES DEL FORMULARIO
// ============================================================

function SeccionPersonal({ data, update }: { data: ProfileFormData; update: (k: keyof ProfileFormData, v: unknown) => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setErrors(p => ({ ...p, foto: 'Máx 2MB permitido.' })); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setErrors(p => ({ ...p, foto: 'Solo JPG, PNG o WEBP.' })); return }
    setErrors(p => ({ ...p, foto: '' }))
    setPreviewUrl(URL.createObjectURL(file))
    // En producción aquí se subiría a Supabase Storage
    update('foto_url', file.name)
  }

  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Información Personal</h3>

      {/* Foto de Perfil */}
      <div>
        <FieldLabel>Foto de Perfil <span className="text-slate-400 font-normal normal-case">(opcional, máx. 2MB)</span></FieldLabel>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300 overflow-hidden shrink-0">
            {previewUrl
              ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              : <User className="w-8 h-8 text-slate-400" />
            }
          </div>
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 text-xs font-bold text-slate-500 hover:text-blue-700 transition-all">
            <Upload className="w-4 h-4" />
            Subir foto
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
          </label>
        </div>
        <ErrorMsg msg={errors.foto} />
      </div>

      <TextInput
        label="País y Ciudad de Residencia" required
        value={data.pais_ciudad}
        onChange={v => update('pais_ciudad', v)}
        placeholder="Ej: Costa Rica, San José"
      />

      <TextInput
        label="URL de LinkedIn"
        type="url"
        value={data.linkedin_url}
        onChange={v => update('linkedin_url', v)}
        placeholder="https://linkedin.com/in/tu-perfil"
      />

      <TextAreaInput
        label="Biografía Profesional" required
        value={data.bio}
        onChange={v => update('bio', v)}
        placeholder="Cuéntanos sobre tu trayectoria profesional, logros y motivaciones…"
        max={500}
      />
    </div>
  )
}

function AcademicEntryRow({ entry, index, updateEntry, removeEntry }: {
  entry: AcademicEntry
  index: number
  updateEntry: (idx: number, field: keyof AcademicEntry, value: string) => void
  removeEntry: (idx: number) => void
}) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => String(currentYear - i))
  
  const handleCareerChange = (value: string) => {
    updateEntry(index, 'carrera', value)
    const escuelaSugerida = CARRERA_TO_ESCUELA[value]
    if (escuelaSugerida) {
      updateEntry(index, 'escuela', escuelaSugerida)
    }
  }
  
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-3">
          <SelectInput
            label="Carrera(s) en la UCR" required
            value={entry.carrera}
            onChange={handleCareerChange}
            options={CARRERAS_UCR}
            placeholder="Seleccionar carrera..."
          />
          {entry.carrera && (
            <div className="animate-fade-in">
              <SelectInput
                label="Escuela / Facultad" required
                value={entry.escuela}
                onChange={v => updateEntry(index, 'escuela', v)}
                options={ESCUELAS_UCR}
                placeholder="Seleccionar escuela/facultad..."
              />
            </div>
          )}
          {entry.escuela && (
            <div className="animate-fade-in">
              <SelectInput
                label="Año de Graduación" required
                value={entry.anio}
                onChange={v => updateEntry(index, 'anio', v)}
                options={years}
                placeholder="Seleccionar año..."
              />
            </div>
          )}
        </div>
        {index > 0 && (
          <button
            type="button"
            onClick={() => removeEntry(index)}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
            aria-label="Eliminar carrera"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function SeccionAcademica({ data, update }: { data: ProfileFormData; update: (k: keyof ProfileFormData, v: unknown) => void }) {
  const updateEntry = (idx: number, field: keyof AcademicEntry, value: string) => {
    const newAcademic = [...data.academic]
    newAcademic[idx] = { ...newAcademic[idx], [field]: value }
    update('academic', newAcademic)
  }
  const addEntry = () => {
    update('academic', [...data.academic, { carrera: '', escuela: '', anio: '' }])
  }
  const removeEntry = (idx: number) => {
    update('academic', data.academic.filter((_, i) => i !== idx))
  }
  
  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Historial Académico UCR</h3>
      {data.academic.map((entry, idx) => (
        <AcademicEntryRow
          key={idx}
          entry={entry}
          index={idx}
          updateEntry={updateEntry}
          removeEntry={removeEntry}
        />
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="text-xs font-bold text-blue-700 hover:underline uppercase tracking-wider"
      >
        + Agregar otra carrera
      </button>
    </div>
  )
}

function SeccionProfesional({ data, update }: { data: ProfileFormData; update: (k: keyof ProfileFormData, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Información Profesional Actual</h3>
      <TextInput label="Empresa o Institución Actual" required value={data.empresa_actual} onChange={v => update('empresa_actual', v)} placeholder="Ej: Google, Ministerio de Salud, Freelancer" />
      <TextInput label="Cargo Actual" required value={data.cargo_actual} onChange={v => update('cargo_actual', v)} placeholder="Ej: Ingeniería de Software Senior" />
      <MultiSelectChips
        label="Sector / Industria" required
        selected={data.sector_industria}
        options={SECTORES_INDUSTRIA}
        onChange={v => update('sector_industria', v)}
        max={5}
      />
      <div>
        <label htmlFor="anos-experiencia" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Años de Experiencia Laboral<span className="text-rose-500 ml-1">*</span></label>
        <input
          id="anos-experiencia"
          type="number" min="0" max="60"
          value={data.anos_experiencia}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('anos_experiencia', e.target.value)}
          className="w-32 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
        />
      </div>
    </div>
  )
}

function SeccionIntereses({ data, update }: { data: ProfileFormData; update: (k: keyof ProfileFormData, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Áreas de Interés</h3>
      <p className="text-xs text-slate-500 font-medium leading-relaxed bg-blue-50 border border-blue-100 rounded-xl p-4">
        💡 <strong>Importante:</strong> Estas áreas van más allá de tu carrera formal. Un ingeniero puede marcar "Salud" o "Emprendimiento". Esto permite conexiones interdisciplinarias con estudiantes que tienen intereses similares.
      </p>
      <MultiSelectChips
        label="Áreas donde puedes ayudar" required
        selected={data.areas_de_interes}
        options={AREAS_INTERES}
        onChange={v => update('areas_de_interes', v)}
      />
      {data.areas_de_interes.length === 0 && (
        <p className="text-xs text-amber-600 font-semibold">⚠ Debes seleccionar al menos 1 área de interés.</p>
      )}
    </div>
  )
}

function SeccionApoyo({ data, update }: { data: ProfileFormData; update: (k: keyof ProfileFormData, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="font-bold text-slate-800 text-base uppercase tracking-wide border-b border-slate-100 pb-2">Tipo de Apoyo Ofrecido</h3>
      <p className="text-xs text-slate-500 font-medium">Selecciona todo el apoyo que estás dispuesto a ofrecer a la comunidad estudiantil UCR.</p>

      <div className="space-y-4">
        {/* Mentoría */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={data.ofrece_mentoria} onChange={e => update('ofrece_mentoria', e.target.checked)} className="w-4 h-4 rounded text-blue-700 focus:ring-blue-600" />
            <span className="text-sm font-bold text-slate-800">🎓 Ofrezco Mentoría</span>
          </label>
          {data.ofrece_mentoria && (
            <div className="pl-7">
              <label htmlFor="horas-mentoria" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Horas disponibles por mes (1–40)<span className="text-rose-500 ml-1">*</span></label>
              <input
                id="horas-mentoria"
                type="number" min="1" max="40"
                value={data.horas_mes_mentoria}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('horas_mes_mentoria', e.target.value)}
                className="w-32 h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
              />
            </div>
          )}
        </div>

        {/* Empleo y Pasantía */}
        {[
          { key: 'ofrece_empleo', label: '💼 Ofrezco Oportunidades de Empleo' },
          { key: 'ofrece_pasantia', label: '📋 Ofrezco Pasantías' },
          { key: 'ofrece_proyecto', label: '🤝 Ofrezco Colaboración en Proyectos Empresariales' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 transition-colors">
            <input
              type="checkbox"
              checked={data[key as keyof ProfileFormData] as boolean}
              onChange={e => update(key as keyof ProfileFormData, e.target.checked)}
              className="w-4 h-4 rounded text-blue-700 focus:ring-blue-600"
            />
            <span className="text-sm font-bold text-slate-800">{label}</span>
          </label>
        ))}

        {/* Donación */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={data.ofrece_donacion_dinero} onChange={e => update('ofrece_donacion_dinero', e.target.checked)} className="w-4 h-4 rounded text-blue-700 focus:ring-blue-600" />
            <span className="text-sm font-bold text-slate-800">💰 Ofrezco Donación Económica</span>
          </label>
          {data.ofrece_donacion_dinero && (
            <div className="pl-7 space-y-3">
              <p className="text-[10px] text-slate-500 font-semibold bg-amber-50 border border-amber-100 rounded-lg p-2">🔒 Este monto es privado y solo es visible para ti y el administrador.</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <FieldLabel required>Monto máximo de donación</FieldLabel>
                  <input
                    type="number" min="0"
                    value={data.monto_maximo_donacion}
                    onChange={e => update('monto_maximo_donacion', e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="moneda-donacion" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Moneda<span className="text-rose-500 ml-1">*</span></label>
                  <select
                    id="moneda-donacion"
                    value={data.moneda_donacion}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('moneda_donacion', e.target.value as 'CRC' | 'USD')}
                    className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="CRC">₡ CRC</option>
                    <option value="USD">$ USD</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// VALIDACIÓN POR PASO
// ============================================================
function validateStep(step: number, data: ProfileFormData): string[] {
  const errs: string[] = []
  if (step === 1) {
    if (!data.pais_ciudad.trim()) errs.push('País y ciudad son obligatorios.')
    if (data.linkedin_url.trim() && !data.linkedin_url.startsWith('http')) errs.push('LinkedIn debe ser una URL válida (empieza con http).')
    if (!data.bio.trim()) errs.push('La biografía es obligatoria.')
  }
  if (step === 2) {
    if (data.academic.length === 0 || !data.academic[0].carrera) errs.push('Selecciona al menos una carrera UCR.')
    if (!data.academic[0].escuela) errs.push('La escuela / facultad es obligatoria.')
    if (!data.academic[0].anio) errs.push('El año de graduación es obligatorio.')
  }
  if (step === 3) {
    if (!data.empresa_actual.trim()) errs.push('Empresa actual es obligatoria.')
    if (!data.cargo_actual.trim()) errs.push('Cargo actual es obligatorio.')
    if (data.sector_industria.length === 0) errs.push('Selecciona al menos un sector.')
    if (!data.anos_experiencia) errs.push('Los años de experiencia son obligatorios.')
  }
  if (step === 4) {
    if (data.areas_de_interes.length === 0) errs.push('Selecciona al menos un área de interés.')
  }
  if (step === 5) {
    if (data.ofrece_mentoria && (!data.horas_mes_mentoria || Number(data.horas_mes_mentoria) < 1 || Number(data.horas_mes_mentoria) > 40)) errs.push('Horas de mentoría debe ser entre 1 y 40.')
    if (data.ofrece_donacion_dinero && !data.monto_maximo_donacion) errs.push('Ingresa el monto máximo de donación.')
  }
  return errs
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ProfileEditPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ProfileFormData>(INITIAL)
  const [errors, setErrors] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const update = useCallback((key: keyof ProfileFormData, value: unknown) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  const progress = Math.round(((step - 1) / STEPS.length) * 100)

  const goNext = () => {
    const errs = validateStep(step, data)
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setStep(s => Math.min(s + 1, 5))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goPrev = () => {
    setErrors([])
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    const errs = validateStep(step, data)
    if (errs.length > 0) { setErrors(errs); return }
    setIsSaving(true)
    // En producción: llamada a Supabase para UPDATE en tabla exalumnos
    // const supabase = createClient()
    // await supabase.from('exalumnos').update({ ...data, perfil_completo: true, visible_en_directorio: true }).eq('user_id', userId)
    await new Promise(r => setTimeout(r, 1500))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => { window.location.href = '/profile' }, 1500)
  }

  const renderStep = () => {
    switch (step) {
      case 1: return <SeccionPersonal data={data} update={update} />
      case 2: return <SeccionAcademica data={data} update={update} />
      case 3: return <SeccionProfesional data={data} update={update} />
      case 4: return <SeccionIntereses data={data} update={update} />
      case 5: return <SeccionApoyo data={data} update={update} />
    }
  }

  if (saved) {
    return (
      <div className="flex items-center justify-center py-12 px-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase font-display">¡Perfil Guardado!</h2>
          <p className="text-sm text-slate-600 font-medium">Tu perfil está completo y ya aparece en el directorio de exalumnos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="pt-2 space-y-1">
          <Link href="/profile" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-institutional transition-colors uppercase tracking-wider mb-3">
            <ArrowLeft className="w-4 h-4" /> Volver al perfil
          </Link>
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">Completar Perfil</h1>
          <p className="text-sm text-slate-600 font-medium">Tu perfil aparecerá en el directorio una vez completado al 100%.</p>
        </div>

        {/* Barra de Progreso */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Progreso del Perfil</span>
            <span className="text-xs font-black text-institutional">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <ProgressFill value={progress} />
          </div>
          {/* Indicadores de pasos */}
          <div className="flex items-center justify-between">
            {STEPS.map(({ id, label, icon: Icon }) => (
              <div key={id} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  step === id ? 'bg-institutional text-white shadow-md' :
                  step > id ? 'bg-emerald-500 text-white' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {step > id ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wide hidden sm:block ${step === id ? 'text-institutional' : step > id ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
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
            onClick={goPrev}
            className={`flex items-center gap-2 font-bold uppercase text-xs ${step === 1 ? 'invisible' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Button>

          {step < 5 ? (
            <Button variant="primary" onClick={goNext} className="flex items-center gap-2 bg-institutional hover:bg-slate-800 font-bold uppercase text-xs px-6">
              Siguiente <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold uppercase text-xs px-6"
            >
              <CheckCircle2 className="w-4 h-4" /> Guardar Perfil
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
