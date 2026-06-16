'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import {
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Save,
  AlertCircle, Plus, Trash2, GripVertical
} from 'lucide-react'
import { crearPosicion } from '@/actions/positions'
import type { PosicionFormValues } from '@/lib/validations/posiciones'
import { useProfile } from '@/contexts/ProfileContext'

// ──────────────────────────────────────────────
// Catálogo de sectores disponibles
// ──────────────────────────────────────────────
const SECTORES_CATALOGO = [
  'Tecnología',
  'Finanzas',
  'Educación',
  'Salud',
  'Ingeniería',
  'Artes y Diseño',
  'Marketing',
  'Derecho',
  'Ciencias',
  'Agronomía',
]

const MAX_CONTEXTO = 300
const MIN_RESP = 3
const MAX_RESP = 10

export default function PublishJobPage() {
  const router = useRouter()
  const { user } = useProfile()
  const [step, setStep] = useState(1)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const isStudent = user?.user_metadata?.rol === 'estudiante'

  React.useEffect(() => {
    const isAdmin = user?.user_metadata?.rol === 'admin' || user?.user_metadata?.tipo === 'admin'
    if (isAdmin) {
      router.replace('/jobs')
    }
  }, [user, router])

  // Datos del formulario alineados con PosicionFormValues (Zod Schema)
  const [formData, setFormData] = useState<PosicionFormValues>({
    titulo: '',
    tipo: 'Empleo',
    modalidad: 'Híbrido',
    jornada: 'Tiempo completo',
    lugar: 'San José, Costa Rica',
    empresa: 'Tech Costa Rica',
    sector: [],
    fecha_limite: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split('T')[0],
    habilidades_requeridas: [],
    descripcion_general: '',
    responsabilidades: [],
    contexto_equipo: '',
  })

  // Lista dinámica de responsabilidades (mínimo 3, máximo 10)
  const [responsabilidades, setResponsabilidades] = useState<string[]>(['', '', ''])

  // Habilidades separadas por coma
  const [tempHab, setTempHab] = useState('')

  // Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ─── Handlers generales ─────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const c = { ...prev }; delete c[name]; return c })
  }

  // ─── Sector (múltiple) ───────────────────────
  const toggleSector = (sector: string) => {
    setFormData((prev) => {
      const already = prev.sector.includes(sector)
      return {
        ...prev,
        sector: already ? prev.sector.filter((s) => s !== sector) : [...prev.sector, sector],
      }
    })
    if (errors.sector) setErrors((p) => { const c = { ...p }; delete c.sector; return c })
  }

  // ─── Responsabilidades dinámicas ─────────────
  const addResp = () => {
    if (responsabilidades.length < MAX_RESP) {
      setResponsabilidades((prev) => [...prev, ''])
    }
  }

  const removeResp = (idx: number) => {
    if (responsabilidades.length > MIN_RESP) {
      setResponsabilidades((prev) => prev.filter((_, i) => i !== idx))
    }
  }

  const updateResp = (idx: number, value: string) => {
    setResponsabilidades((prev) => prev.map((r, i) => (i === idx ? value : r)))
    if (errors.responsabilidades) setErrors((p) => { const c = { ...p }; delete c.responsabilidades; return c })
  }

  // ─── Validación por paso ─────────────────────
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.titulo.trim() || formData.titulo.length < 5)
        newErrors.titulo = 'El título debe tener al menos 5 caracteres'
      if (!formData.lugar.trim())
        newErrors.lugar = 'La ubicación es obligatoria'
      if (formData.sector.length === 0)
        newErrors.sector = 'Selecciona al menos un sector'
    } else if (currentStep === 2) {
      if (!formData.descripcion_general.trim() || formData.descripcion_general.length < 50)
        newErrors.descripcion_general = 'La descripción debe tener al menos 50 caracteres'

      const respValidas = responsabilidades.filter((r) => r.trim().length > 0)
      if (respValidas.length < MIN_RESP)
        newErrors.responsabilidades = `Debes tener al menos ${MIN_RESP} responsabilidades con contenido`
      if (respValidas.length > MAX_RESP)
        newErrors.responsabilidades = `No puedes superar ${MAX_RESP} responsabilidades`

      const habs = tempHab.split(',').filter((h) => h.trim().length > 0)
      if (habs.length < 1)
        newErrors.habilidades_requeridas = 'Agrega al menos una habilidad requerida (separadas por coma)'

      if (formData.contexto_equipo && formData.contexto_equipo.length > MAX_CONTEXTO)
        newErrors.contexto_equipo = `El contexto del equipo no puede superar los ${MAX_CONTEXTO} caracteres`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 2) {
        setFormData((prev) => ({
          ...prev,
          responsabilidades: responsabilidades.map((r) => r.trim()).filter((r) => r.length > 0),
          habilidades_requeridas: tempHab.split(',').map((h) => h.trim()).filter((h) => h.length > 0),
        }))
      }
      setStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => setStep((prev) => prev - 1)

  const handlePublish = async () => {
    setServerError(null)
    setIsPublishing(true)

    const mappedData = {
      ...formData,
      tipo: (formData.tipo === 'Empleo' ? 'empleo' : 'pasantia') as 'empleo' | 'pasantia',
      modalidad: (formData.modalidad === 'Híbrido'
        ? 'hibrido'
        : formData.modalidad === 'Remoto'
        ? 'remoto'
        : 'presencial') as 'presencial' | 'remoto' | 'hibrido',
      jornada: (formData.jornada === 'Tiempo completo'
        ? 'tiempo_completo'
        : formData.jornada === 'Medio tiempo'
        ? 'medio_tiempo'
        : 'por_proyecto') as 'tiempo_completo' | 'medio_tiempo' | 'por_proyecto',
      contexto_equipo: formData.contexto_equipo || undefined,
    }

    try {
      const result = await crearPosicion(mappedData)
      setIsPublishing(false)
      if (result.success) {
        setIsPublished(true)
        setTimeout(() => router.push('/jobs'), 1500)
      }
    } catch (err: any) {
      setIsPublishing(false)
      setServerError(err.message || 'Error desconocido')
      setStep(1)
    }
  }

  const contextoLen = formData.contexto_equipo?.length ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-8 px-6 lg:px-10 relative overflow-hidden">
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute left-10 bottom-10 w-72 h-72 bg-sky-400/10 rounded-full blur-2xl -z-10" />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {isStudent ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
            <p className="text-slate-600 mb-6">Los estudiantes no tienen permiso para crear vacantes o pasantías.</p>
            <Link href="/dashboard">
              <Button variant="primary">Volver al inicio</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Botón Volver */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a vacantes</span>
        </Link>

        {/* Encabezado */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wider">
            Publicar Oportunidad
          </h1>
          <p className="text-sm text-slate-700 font-medium max-w-xl leading-relaxed">
            Crea una vacante de empleo o pasantía exclusiva para graduados y estudiantes de la UCR.
          </p>
        </div>

        {/* Alerta de Error General */}
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong className="block font-bold">No se pudo publicar la vacante</strong>
              {serverError}
            </div>
          </div>
        )}

        {/* Indicador de pasos */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs transition-colors ${
                  step === num
                    ? 'bg-brand-blue text-white shadow-md'
                    : step > num
                    ? 'bg-brand-blue/20 text-brand-blue'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {num}
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${
                  step === num ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {num === 1 ? 'Datos Básicos' : num === 2 ? 'Descripción' : 'Confirmación'}
              </span>
              {num < 3 && <span className="text-slate-300 mx-2 hidden sm:inline">/</span>}
            </div>
          ))}
        </div>

        {/* Tarjeta de Formulario */}
        <Card hoverEffect={false} className="space-y-6 p-6 rounded-2xl border border-slate-200/60 bg-white shadow-lg">

          {/* ══════════════════════════════
              PASO 1: DATOS BÁSICOS
          ══════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="font-display font-extrabold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Datos Básicos de la Vacante
              </h3>

              <Input
                label="Título del Puesto"
                name="titulo"
                placeholder="Ej: Desarrollador Backend React"
                value={formData.titulo}
                onChange={handleChange}
                error={errors.titulo}
                className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />
              <Input
                label="Empresa"
                name="empresa"
                value={formData.empresa}
                disabled
                className="h-11 border-slate-200 bg-slate-100"
              />
              <Input
                label="Ubicación"
                name="lugar"
                placeholder="Ej: San José, Costa Rica"
                value={formData.lugar}
                onChange={handleChange}
                error={errors.lugar}
                className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Tipo de Contrato"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  options={[
                    { value: 'Empleo', label: 'Empleo' },
                    { value: 'Pasantía', label: 'Pasantía' },
                  ]}
                  className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
                />
                <Select
                  label="Jornada"
                  name="jornada"
                  value={formData.jornada}
                  onChange={handleChange}
                  options={[
                    { value: 'Tiempo completo', label: 'Tiempo Completo' },
                    { value: 'Medio tiempo', label: 'Medio Tiempo' },
                    { value: 'Por proyecto', label: 'Por Proyecto' },
                  ]}
                  className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
                />
              </div>

              <Select
                label="Modalidad"
                name="modalidad"
                value={formData.modalidad}
                onChange={handleChange}
                options={[
                  { value: 'Híbrido', label: 'Híbrido' },
                  { value: 'Remoto', label: '100% Remoto' },
                  { value: 'Presencial', label: 'Presencial' },
                ]}
                className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />

              {/* ── Selector múltiple de Sectores ─────────────────── */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Sector(es) de la Vacante
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SECTORES_CATALOGO.map((sector) => {
                    const isSelected = formData.sector.includes(sector)
                    return (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => toggleSector(sector)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-150 ${
                          isSelected
                            ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue hover:text-brand-blue'
                        }`}
                      >
                        {isSelected && <span className="mr-1">✓</span>}
                        {sector}
                      </button>
                    )
                  })}
                </div>
                {errors.sector && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.sector}</p>
                )}
              </div>

              {/* Fecha límite */}
              <Input
                label="Fecha Límite de Aplicación"
                name="fecha_limite"
                type="date"
                value={formData.fecha_limite ?? ''}
                onChange={handleChange}
                className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />
            </div>
          )}

          {/* ══════════════════════════════
              PASO 2: DESCRIPCIÓN Y REQUISITOS
          ══════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-display font-extrabold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Detalles del Puesto
              </h3>

              <Textarea
                label="Descripción general"
                name="descripcion_general"
                placeholder="Describe detalladamente el puesto, la empresa y las expectativas..."
                value={formData.descripcion_general}
                onChange={handleChange}
                error={errors.descripcion_general}
                className="border-slate-200 focus:border-brand-blue bg-slate-50/50 min-h-[120px]"
              />

              {/* ── Responsabilidades dinámicas ──────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Responsabilidades Principales
                    <span className="ml-1 text-red-500">*</span>
                    <span className="ml-2 text-slate-400 font-normal normal-case tracking-normal">
                      (min {MIN_RESP}, max {MAX_RESP})
                    </span>
                  </label>
                  <span className={`text-xs font-bold ${
                    responsabilidades.filter(r => r.trim()).length >= MIN_RESP
                      ? 'text-emerald-600'
                      : 'text-amber-500'
                  }`}>
                    {responsabilidades.filter(r => r.trim()).length}/{MAX_RESP}
                  </span>
                </div>

                <div className="space-y-2">
                  {responsabilidades.map((resp, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                      <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                      <span className="text-xs font-bold text-slate-400 w-5 shrink-0">{idx + 1}.</span>
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => updateResp(idx, e.target.value)}
                        placeholder={`Responsabilidad ${idx + 1}...`}
                        className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => removeResp(idx)}
                        disabled={responsabilidades.length <= MIN_RESP}
                        className="p-1.5 text-slate-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Eliminar responsabilidad"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {errors.responsabilidades && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.responsabilidades}</p>
                )}

                {responsabilidades.length < MAX_RESP && (
                  <button
                    type="button"
                    onClick={addResp}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir responsabilidad
                  </button>
                )}
              </div>

              <Input
                label="Habilidades Requeridas (separadas por coma)"
                name="habilidades_requeridas"
                placeholder="React, TypeScript, Node.js"
                value={tempHab}
                onChange={(e) => {
                  setTempHab(e.target.value)
                  if (errors.habilidades_requeridas)
                    setErrors((p) => { const c = { ...p }; delete c.habilidades_requeridas; return c })
                }}
                error={errors.habilidades_requeridas}
                className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />

              {/* ── Contexto del equipo (opcional, max 300) ────────── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contexto del Equipo
                    <span className="ml-2 text-slate-400 font-normal normal-case tracking-normal">(opcional)</span>
                  </label>
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      contextoLen > MAX_CONTEXTO
                        ? 'text-red-500'
                        : contextoLen > MAX_CONTEXTO * 0.85
                        ? 'text-amber-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {contextoLen}/{MAX_CONTEXTO}
                  </span>
                </div>
                <textarea
                  name="contexto_equipo"
                  value={formData.contexto_equipo ?? ''}
                  onChange={handleChange}
                  maxLength={MAX_CONTEXTO}
                  placeholder="Cuéntale al candidato cómo es el equipo: cultura, metodología, tamaño del equipo..."
                  rows={4}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 bg-slate-50/50 focus:outline-none focus:ring-1 transition-colors resize-none ${
                    errors.contexto_equipo
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                      : 'border-slate-200 focus:border-brand-blue focus:ring-brand-blue/20'
                  }`}
                />
                {errors.contexto_equipo && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{errors.contexto_equipo}</p>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              PASO 3: CONFIRMACIÓN Y PREVIEW
          ══════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-display font-extrabold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Revisar y Publicar
              </h3>
              <div className="bg-slate-50 p-6 border border-slate-200/60 rounded-2xl space-y-5">
                <h4 className="font-display font-extrabold text-lg text-slate-800 uppercase tracking-wide">
                  {formData.titulo}
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  <p><span className="text-slate-400">Empresa:</span> {formData.empresa}</p>
                  <p><span className="text-slate-400">Ubicación:</span> {formData.lugar}</p>
                  <p><span className="text-slate-400">Modalidad:</span> {formData.modalidad}</p>
                  <p><span className="text-slate-400">Jornada:</span> {formData.jornada}</p>
                  <p><span className="text-slate-400">Tipo:</span> {formData.tipo}</p>
                  <p><span className="text-slate-400">Fecha límite:</span> {formData.fecha_limite}</p>
                </div>

                {/* Sectores seleccionados */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sectores</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.sector.map((s) => (
                      <span key={s} className="bg-brand-blue/10 text-brand-blue text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Responsabilidades */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Responsabilidades ({formData.responsabilidades.length})
                  </p>
                  <ul className="space-y-1">
                    {formData.responsabilidades.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Habilidades */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Habilidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.habilidades_requeridas.map((h) => (
                      <span key={h} className="bg-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contexto del equipo */}
                {formData.contexto_equipo && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Contexto del Equipo</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{formData.contexto_equipo}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Al hacer clic en publicar, la vacante estará disponible de inmediato en la bolsa de empleo para todos los estudiantes y egresados autenticados en el sistema.
              </p>
            </div>
          )}

          {/* Navegación del formulario */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button
                variant="secondary"
                onClick={handlePrev}
                disabled={isPublishing || isPublished}
                className="flex items-center gap-2 font-bold uppercase text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2 font-bold uppercase text-xs px-5"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handlePublish}
                isLoading={isPublishing}
                disabled={isPublishing || isPublished}
                className={`flex items-center gap-2 font-bold uppercase text-xs px-5 shadow-md text-white ${
                  isPublished ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-brand-blue hover:bg-brand-blue/90'
                }`}
              >
                {isPublished ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Publicado!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isPublishing ? 'Publicando...' : 'Publicar Vacante'}</span>
                  </>
                )}
              </Button>
            )}
          </div>

        </Card>
        </>
        )}
      </div>
    </div>
  )
}
