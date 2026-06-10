'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Save } from 'lucide-react'

export default function PublishJobPage() {
  const [step, setStep] = useState(1)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  // Datos de formulario
  const [formData, setFormData] = useState({
    title: '',
    company: 'Tech Costa Rica', // Pre-llenado con empresa del exalumno
    location: 'San José',
    type: 'Tiempo Completo',
    modality: 'Híbrido',
    salary: '',
    desc: '',
    requirements: '',
    responsibilities: ''
  })

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
      if (!formData.title.trim()) newErrors.title = 'El título de la vacante es obligatorio'
      if (!formData.location.trim()) newErrors.location = 'La ubicación es obligatoria'
    } else if (currentStep === 2) {
      if (!formData.desc.trim()) newErrors.desc = 'La descripción es obligatoria'
      if (!formData.requirements.trim()) newErrors.requirements = 'Los requisitos son obligatorios'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setStep((prev) => prev - 1)
  }

  const handlePublish = () => {
    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      setIsPublished(true)
      setTimeout(() => {
        setIsPublished(false)
        window.location.href = '/jobs'
      }, 1500)
    }, 1500)
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
        <Card hoverEffect={false} className="space-y-6 p-6 rounded-2xl border border-slate-200/60 bg-white">
          
          {/* PASO 1: DATOS BÁSICOS */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Datos Básicos de la Vacante
              </h3>
              <Input
                label="Título del Puesto"
                name="title"
                placeholder="Ej: Desarrollador Backend React"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />
              <Input
                label="Empresa"
                name="company"
                value={formData.company}
                disabled
                className="h-11 border-slate-200 bg-slate-100"
              />
              <Input
                label="Ubicación"
                name="location"
                placeholder="Ej: San José, Costa Rica"
                value={formData.location}
                onChange={handleChange}
                error={errors.location}
                className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Tipo de Contrato"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={[
                    { value: 'Tiempo Completo', label: 'Tiempo Completo' },
                    { value: 'Medio Tiempo', label: 'Medio Tiempo' },
                    { value: 'Freelance', label: 'Freelance' },
                    { value: 'Pasantía', label: 'Pasantía' }
                  ]}
                  className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
                />
                <Select
                  label="Modalidad"
                  name="modality"
                  value={formData.modality}
                  onChange={handleChange}
                  options={[
                    { value: 'Híbrido', label: 'Híbrido' },
                    { value: 'Remoto', label: '100% Remoto' },
                    { value: 'Presencial', label: 'Presencial' }
                  ]}
                  className="h-11 border-slate-200 focus:border-brand-blue bg-slate-50/50"
                />
              </div>
            </div>
          )}

          {/* PASO 2: DESCRIPCIÓN Y REQUISITOS */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Detalles del Puesto
              </h3>
              <Textarea
                label="Descripción de responsabilidades"
                name="desc"
                placeholder="Describe detalladamente las tareas diarias del puesto..."
                value={formData.desc}
                onChange={handleChange}
                error={errors.desc}
                className="border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />
              <Textarea
                label="Requisitos clave"
                name="requirements"
                placeholder="Indica las habilidades, certificaciones o herramientas que se requieren..."
                value={formData.requirements}
                onChange={handleChange}
                error={errors.requirements}
                className="border-slate-200 focus:border-brand-blue bg-slate-50/50"
              />
              <Input
                label="Rango Salarial (Mensual)"
                name="salary"
                placeholder="Ej: ₡1,200,000 - ₡1,600,000 o No especificado"
                value={formData.salary}
                onChange={handleChange}
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
                  {formData.title || 'Título de vacante'}
                </h4>
                <div className="space-y-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  <p>Empresa: {formData.company}</p>
                  <p>Ubicación: {formData.location}</p>
                  <p>Modalidad: {formData.modality}</p>
                  <p>Tipo: {formData.type}</p>
                  <p>Compensación: {formData.salary || 'No especificado'}</p>
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
              <Button variant="secondary" onClick={handlePrev} className="flex items-center gap-2 font-bold uppercase text-xs">
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
                className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold uppercase text-xs px-5 shadow-md"
              >
                {isPublished ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>¡Publicado!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publicar Vacante</span>
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
