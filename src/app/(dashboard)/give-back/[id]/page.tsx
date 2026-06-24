'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { ArrowLeft, Clock, Calendar, CheckCircle2, GraduationCap } from 'lucide-react'

const MOCK_OPPORTUNITIES = [
  {
    id: '1',
    title: 'Voluntariado: Charla de Orientación Vocacional',
    category: 'Orientación',
    desc: 'Comparte tu trayectoria y asesora a estudiantes de primer ingreso sobre los desafíos y realidades del mercado laboral actual.',
    duration: '2 horas de sesión única',
    requirements: [
      'Ser exalumno graduado de la UCR.',
      'Disposición de compartir experiencias profesionales de forma virtual.',
      'Disponibilidad para una reunión corta previa de alineación.'
    ],
    schedule: 'Sábado 27 de junio de 2026, 10:00 AM'
  },
  {
    id: '2',
    title: 'Jurado Evaluador para Proyectos de Graduación',
    category: 'Evaluación',
    desc: 'Únete como jurado externo para calificar y retroalimentar los Trabajos Finales de Graduación (TFG) de los estudiantes avanzados.',
    duration: '4 horas distribuidas en 2 semanas',
    requirements: [
      'Graduado de licenciatura o posgrado UCR con al menos 3 años de experiencia profesional.',
      'Revisión minuciosa de informes escritos y prototipos funcionales.',
      'Emitir una rúbrica formal de evaluación final.'
    ],
    schedule: 'Periodo de evaluación: Julio 2026'
  },
  {
    id: '3',
    title: 'Apoyo a Proyectos de TFG Estudiantiles',
    category: 'Proyecto Universitario',
    desc: 'Brinda apoyo técnico o acceso a datos mock/empresariales para estudiantes que requieren soporte industrial en su tesis.',
    duration: 'Frecuencia variable',
    requirements: [
      'Permiso o acceso controlado a datos anonimizados o retos reales de la industria.',
      'Reunión de seguimiento mensual con el estudiante y su tutor académico.'
    ],
    schedule: 'A coordinar directamente con el estudiante'
  }
]

interface GiveBackDetailPageProps {
  params: Promise<{ id: string }>
}

export default function GiveBackDetailPage({ params }: GiveBackDetailPageProps) {
  const { id } = React.use(params)
  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id) || MOCK_OPPORTUNITIES[0]

  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  const handleRegister = () => {
    setIsRegistering(true)
    setTimeout(() => {
      setIsRegistering(false)
      setIsRegistered(true)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <Link href="/give-back" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-emerald transition-colors uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a oportunidades</span>
      </Link>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ficha de Detalles */}
        <div className="lg:col-span-2 space-y-6">
          <Card hoverEffect={false} className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                {opp.category}
              </span>
              <h1 className="text-2xl font-extrabold uppercase font-display text-slate-800 tracking-wide">
                {opp.title}
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed pt-2">
                {opp.desc}
              </p>
            </div>

            {opp.requirements && (
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                  Requisitos de participación
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                  {opp.requirements.map((req, idx) => (
                    <li key={idx} className="leading-relaxed">{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* Tarjeta de Acción */}
        <div>
          <Card hoverEffect={false} className="space-y-6">
            <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider text-center">
              Tu Compromiso
            </h3>
            
            <div className="space-y-3 text-xs text-slate-600 font-medium">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Compromiso: {opp.duration}</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Fecha: {opp.schedule}</span>
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6">
              {isRegistered ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>¡Ya estás registrado en el proyecto!</span>
                </div>
              ) : (
                <Button
                  onClick={handleRegister}
                  isLoading={isRegistering}
                  className="w-full h-12 text-sm uppercase tracking-wider font-bold"
                >
                  Quiero Participar
                </Button>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
