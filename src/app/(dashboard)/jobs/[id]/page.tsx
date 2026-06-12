'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { Input, Textarea } from '@/components/ui/input'
import { ArrowLeft, MapPin, Building, Briefcase, Calendar, CheckCircle2, Sparkles } from 'lucide-react'
import { obtenerVersionAdaptadaPorPosicion } from '@/actions/accionGuardarVersion'

// Datos de vacantes mock
const MOCK_JOBS = [
  {
    id: '1',
    title: 'Desarrollador React Senior',
    company: 'Tech Costa Rica',
    location: 'San José (Híbrido)',
    type: 'Tiempo Completo',
    modality: 'Híbrido',
    salary: '₡1,800,000 - ₡2,400,000',
    desc: 'Buscamos un desarrollador React experimentado para liderar el rediseño de nuestras plataformas de comercio electrónico.',
    posted: 'Hace 2 días',
    requirements: [
      'Más de 5 años de experiencia con React, TypeScript y Redux/Zustand.',
      'Experiencia sólida en diseño responsivo y optimización de rendimiento frontend.',
      'Familiaridad con prácticas de CI/CD e infraestructura en la nube.',
      'Graduado o estudiante avanzado de la UCR.'
    ],
    responsibilities: [
      'Liderar el desarrollo de nuevas interfaces de usuario utilizando Next.js.',
      'Colaborar estrechamente con diseñadores UI/UX y desarrolladores backend.',
      'Escribir pruebas unitarias y de integración robustas.',
      'Mentorear a desarrolladores junior en el equipo.'
    ]
  },
  {
    id: '2',
    title: 'Analista de Datos Junior',
    company: 'Finanzas Globales',
    location: 'Remoto',
    type: 'Tiempo Completo',
    modality: 'Remoto',
    salary: 'No especificado',
    desc: 'Únete a nuestro equipo de análisis financiero. Experiencia básica en SQL y Python/R requerida.',
    posted: 'Hace 4 días',
    requirements: [
      'Bachillerato universitario en Computación, Estadística o Matemáticas (UCR).',
      'Conocimientos sólidos en SQL y herramientas de BI (PowerBI/Tableau).',
      'Nivel de inglés intermedio-avanzado.'
    ],
    responsibilities: [
      'Crear y mantener dashboards analíticos para el equipo de finanzas.',
      'Extraer y procesar grandes volúmenes de datos transaccionales.',
      'Generar informes periódicos sobre tendencias de mercado.'
    ]
  },
  {
    id: '3',
    title: 'Diseñador UI/UX Senior',
    company: 'Creativos Digitales',
    location: 'San Pedro (Presencial)',
    type: 'Medio Tiempo / Freelance',
    modality: 'Presencial',
    salary: '₡800,000 - ₡1,200,000',
    desc: 'Buscamos un diseñador con portafolio de Figma comprobado para optimizar las interacciones en aplicaciones móviles financieras.',
    posted: 'Hace 1 semana',
    requirements: [
      'Más de 4 años de experiencia en diseño de interfaces e investigación de usuarios.',
      'Dominio experto de Figma y herramientas de prototipado.',
      'Conocimiento en guías de marca e identidad corporativa.'
    ],
    responsibilities: [
      'Crear maquetas interactivas y wireframes de alta fidelidad.',
      'Realizar pruebas de usabilidad con usuarios finales.',
      'Mantener y escalar el sistema de diseño del producto.'
    ]
  }
]

interface JobDetailPageProps {
  params: { id: string }
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = params
  const job = MOCK_JOBS.find((j) => j.id === id) || MOCK_JOBS[0]

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [fileName, setFileName] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [versionAdaptada, setVersionAdaptada] = useState<any>(null)
  const [selectedCvType, setSelectedCvType] = useState<'base' | 'adaptado' | null>(null)
  const [isFetchingVersion, setIsFetchingVersion] = useState(false)

  React.useEffect(() => {
    async function fetchVersion() {
      setIsFetchingVersion(true)
      const res = await obtenerVersionAdaptadaPorPosicion(id)
      if (res.success && res.version) {
        setVersionAdaptada(res.version)
      }
      setIsFetchingVersion(false)
    }
    fetchVersion()
  }, [id])

  const handleApplyClick = () => {
    if (versionAdaptada) {
      setSelectedCvType(null)
    } else {
      setSelectedCvType('base')
    }
    setIsModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  const handleApplySubmit = () => {
    setIsApplying(true)
    setTimeout(() => {
      setIsApplying(false)
      setIsApplied(true)
      setIsModalOpen(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <Link href="/jobs" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-emerald transition-colors uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a vacantes</span>
      </Link>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Información de Puesto */}
        <div className="lg:col-span-2 space-y-6">
          <Card hoverEffect={false} className="space-y-6">
            <div className="flex items-start gap-4 flex-col sm:flex-row">
              <div className="w-14 h-14 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center shrink-0">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold uppercase font-display text-slate-800 tracking-wide">
                  {job.title}
                </h1>
                <p className="text-sm font-semibold text-brand-emerald">{job.company}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Publicado {job.posted}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                Descripción del puesto
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {job.desc}
              </p>
            </div>

            {job.requirements && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                  Requisitos clave
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="leading-relaxed">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsibilities && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                  Responsabilidades principales
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="leading-relaxed">{resp}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* Columna Derecha: Tarjeta de Acción */}
        <div className="space-y-6">
          <Card hoverEffect={false} className="space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Compensación</span>
              <span className="text-xl font-bold text-brand-emerald block">{job.salary}</span>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Moneda local (CRC)</span>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              {isApplied ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>¡Aplicación enviada con éxito!</span>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleApplyClick}
                    className="w-full h-12 text-sm uppercase tracking-wider font-bold"
                    disabled={isFetchingVersion}
                  >
                    {isFetchingVersion ? 'Cargando...' : 'Aplicar Ahora'}
                  </Button>
                  <Link href={`/jobs/${id}/adaptar`} className="w-full">
                    <Button
                      variant="secondary"
                      className="w-full h-12 text-sm uppercase tracking-wider font-bold mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2 inline" />
                      Adaptar CV con IA
                    </Button>
                  </Link>
                </>
              )}
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Requiere validación de grado UCR
              </span>
            </div>
          </Card>
        </div>

      </div>

      {/* Modal de Aplicación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enviar Postulación"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleApplySubmit}
              isLoading={isApplying}
              disabled={!selectedCvType}
            >
              Confirmar Aplicación
            </Button>
          </>
        }
      >
        <div className="space-y-5 text-left">
          <p className="text-xs text-slate-500">
            Completa tu información de postulación para <span className="font-bold text-slate-800">{job.title}</span> en <span className="font-bold text-slate-800">{job.company}</span>.
          </p>

          {versionAdaptada && !selectedCvType && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-orange-900 mb-1">CV Optimizado Detectado</h4>
                    <p className="text-xs text-orange-800">
                      Detectamos que creaste un CV optimizado para esta vacante. ¿Deseas aplicar utilizando tu <strong>{versionAdaptada.titulo_version}</strong> o prefieres usar tu CV Base?
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div 
                  className="border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:border-brand-emerald/50 transition-colors"
                  onClick={() => setSelectedCvType('adaptado')}
                >
                  <h5 className="font-bold text-sm text-slate-800">{versionAdaptada.titulo_version}</h5>
                  <p className="text-xs text-slate-500 mt-1">Usar la versión optimizada con IA para aumentar tus posibilidades.</p>
                </div>
                <div 
                  className="border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:border-brand-emerald/50 transition-colors"
                  onClick={() => setSelectedCvType('base')}
                >
                  <h5 className="font-bold text-sm text-slate-800">CV Base</h5>
                  <p className="text-xs text-slate-500 mt-1">Usar tu curriculum estándar registrado en la plataforma.</p>
                </div>
              </div>
            </div>
          )}

          {selectedCvType && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Currículum Seleccionado
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-sm font-medium text-slate-700">
                    {selectedCvType === 'adaptado' ? versionAdaptada?.titulo_version : 'CV Base del Sistema'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 mt-4">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Adjuntar Currículum Adicional (PDF) - Opcional
                </label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-brand-emerald/40 transition-colors cursor-pointer bg-slate-50">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="text-xs font-bold text-brand-emerald block uppercase">
                    {fileName ? `✓ ${fileName}` : 'Buscar Archivo PDF'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 uppercase font-semibold">
                    Máximo 5MB
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Textarea
                  label="Carta de Motivación (Opcional)"
                  placeholder="Escribe brevemente por qué te interesa este puesto y cómo encaja tu perfil..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
