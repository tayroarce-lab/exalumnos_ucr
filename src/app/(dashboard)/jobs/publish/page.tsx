'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Save, AlertCircle } from 'lucide-react'
import { crearPosicion } from '@/actions/posiciones'
import type { PosicionFormValues } from '@/lib/validations/posiciones'

export default function PublishJobPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Datos de formulario alineados con PosicionFormValues (Zod Schema)
  const [formData, setFormData] = useState<PosicionFormValues>({
    titulo: '',
    tipo: 'Empleo',
    modalidad: 'Híbrido',
    jornada: 'Tiempo completo',
    lugar: 'San José, Costa Rica',
    empresa: 'Tech Costa Rica', // En la vida real provendría del perfil
    sector: ['Tecnología'],
    fecha_limite: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // 1 mes a futuro
    habilidades_requeridas: [],
    descripcion_general: '',
    responsabilidades: [],
    contexto_equipo: ''
  })

  // Para inputs de texto que se convierten a arreglos (separados por coma o saltos)
  const [tempResp, setTempResp] = useState('')
  const [tempHab, setTempHab] = useState('')

  // Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpiar error
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.titulo.trim() || formData.titulo.length < 5) newErrors.titulo = 'El título debe tener al menos 5 caracteres'
      if (!formData.lugar.trim()) newErrors.lugar = 'La ubicación es obligatoria'
    } else if (currentStep === 2) {
      if (!formData.descripcion_general.trim() || formData.descripcion_general.length < 50) {
        newErrors.descripcion_general = 'La descripción debe tener al menos 50 caracteres'
      }
      
      const resps = tempResp.split('\n').filter(r => r.trim().length > 0)
      if (resps.length < 3) {
        newErrors.responsabilidades = 'Debe agregar al menos 3 responsabilidades (una por línea)'
      }

      const habs = tempHab.split(',').filter(h => h.trim().length > 0)
      if (habs.length < 1) {
        newErrors.habilidades_requeridas = 'Debe agregar al menos una habilidad requerida (separadas por coma)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 2) {
        // Parsear textarea a arrays para el step final
        setFormData(prev => ({
          ...prev,
          responsabilidades: tempResp.split('\n').map(r => r.trim()).filter(r => r.length > 0),
          habilidades_requeridas: tempHab.split(',').map(h => h.trim()).filter(h => h.length > 0)
        }))
      }
      setStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setStep((prev) => prev - 1)
  }

  const handlePublish = async () => {
    setServerError(null)
    setIsPublishing(true)
    
    const result = await crearPosicion(formData)

    setIsPublishing(false)
    if (result.success) {
      setIsPublished(true)
      setTimeout(() => {
        router.push('/jobs')
      }, 1500)
    } else {
      setServerError(result.error || 'Error desconocido')
      if (result.details) {
        // Mapear errores de Zod si los hay al estado local
        const zodErrs: Record<string, string> = {}
        for (const [key, val] of Object.entries(result.details)) {
          if (Array.isArray(val) && val.length > 0) zodErrs[key] = val[0]
        }
        setErrors(zodErrs)
        setStep(1) // Volver al inicio para revisar errores
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-8 px-6 lg:px-10 relative overflow-hidden">
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute left-10 bottom-10 w-72 h-72 bg-sky-400/10 rounded-full blur-2xl -z-10"></div>

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Botón Volver */}
        <Link href="/jobs" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors uppercase tracking-wider">
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
          
          {/* PASO 1: DATOS BÁSICOS */}
          {step === 1 && (
            <div className="space-y-4">
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
                    { value: 'Pasantía', label: 'Pasantía' }
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
                    { value: 'Por proyecto', label: 'Por Proyecto' }
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
                  { value: 'Presencial', label: 'Presencial' }
                ]}
                className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />
            </div>
          )}

          {/* PASO 2: DESCRIPCIÓN Y REQUISITOS */}
          {step === 2 && (
            <div className="space-y-4">
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
              <Textarea
                label="Responsabilidades Clave (Una por línea, min 3)"
                name="responsabilidades"
                placeholder="1. Desarrollar APIs RESTful&#10;2. Mantener la infraestructura cloud&#10;3. Realizar code reviews..."
                value={tempResp}
                onChange={(e) => {
                  setTempResp(e.target.value)
                  if(errors.responsabilidades) setErrors(p => ({...p, responsabilidades: ''}))
                }}
                error={errors.responsabilidades}
                className="border-slate-200 focus:border-brand-blue bg-slate-50/50 min-h-[120px]"
              />
              <Input
                label="Habilidades Requeridas (separadas por coma)"
                name="habilidades_requeridas"
                placeholder="React, TypeScript, Node.js"
                value={tempHab}
                onChange={(e) => {
                  setTempHab(e.target.value)
                  if(errors.habilidades_requeridas) setErrors(p => ({...p, habilidades_requeridas: ''}))
                }}
                error={errors.habilidades_requeridas}
                className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />
            </div>
          )}

          {/* PASO 3: CONFIRMACIÓN Y PREVIEW */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-display font-extrabold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Revisar y Publicar
              </h3>
              <div className="bg-slate-50 p-6 border border-slate-200/60 rounded-2xl space-y-4">
                <h4 className="font-display font-extrabold text-lg text-slate-800 uppercase tracking-wide">
                  {formData.titulo}
                </h4>
                <div className="space-y-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  <p>Empresa: {formData.empresa}</p>
                  <p>Ubicación: {formData.lugar}</p>
                  <p>Modalidad: {formData.modalidad}</p>
                  <p>Tipo: {formData.tipo}</p>
                  <p>Jornada: {formData.jornada}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Al hacer clic en publicar, la vacante estará disponible de inmediato en la bolsa de empleo para todos los estudiantes y egresados autenticados en el sistema.
              </p>
            </div>
          )}

          {/* Navegación del formulario */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 bg-white">
            {step > 1 ? (
              <Button variant="secondary" onClick={handlePrev} disabled={isPublishing || isPublished} className="flex items-center gap-2 font-bold uppercase text-xs">
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </Button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <Button variant="primary" onClick={handleNext} className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2 font-bold uppercase text-xs px-5">
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
      </div>
    </div>
  )
}
