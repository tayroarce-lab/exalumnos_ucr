'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { ArrowLeft, Calendar, MapPin, Video, CheckCircle2, Clock, ShieldAlert } from 'lucide-react'

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Encuentro Anual de Egresados 2026',
    category: 'Presencial',
    date: '15 de Junio, 2026',
    time: '6:00 PM - 9:00 PM',
    location: 'Auditorio Abelardo Bonilla, Sede Rodrigo Facio, UCR',
    desc: 'Un espacio de reencuentro, networking y discusión sobre las tendencias tecnológicas y económicas en Costa Rica.',
    details: 'Únete a la mayor red de egresados de la Universidad de Costa Rica. Contaremos con un panel de egresados exitosos en el extranjero, música en vivo y un refrigerio de cortesía. Acreditación indispensable al ingresar.',
    organizer: 'Asociación Alumni UCR & Fundación de Exalumnos UCR'
  },
  {
    id: '2',
    title: 'Webinar: Inteligencia Artificial en Modelos de Negocio',
    category: 'Virtual',
    date: '20 de Junio, 2026',
    time: '10:00 AM - 12:00 PM',
    location: 'Transmisión en Vivo (Zoom)',
    desc: 'Aprende cómo las corporaciones modernas integran modelos generativos para optimizar sus procesos de desarrollo y marketing.',
    details: 'Impartido por el Ing. Carlos Salazar (Staff Engineer en AWS). Se requiere registro previo para recibir el enlace de acceso de Zoom y los materiales complementarios del taller.',
    organizer: 'Escuela de Ciencias de la Computación e Informática (ECCI), UCR'
  },
  {
    id: '3',
    title: 'Congreso de Innovación y Sostenibilidad',
    category: 'Presencial',
    date: '05 de Julio, 2026',
    time: '8:30 AM - 4:30 PM',
    location: 'Aula Magna, Ciudad de la Investigación, UCR',
    desc: 'Charlas magistrales con expertos internacionales y presentación de TFGs estudiantiles con enfoque sostenible.',
    details: 'Un evento enfocado en soluciones limpias, optimización energética y proyectos de graduación universitarios destacados. Incluye certificado de participación en formato digital.',
    organizer: 'Vicerrectoría de Investigación, UCR'
  }
]

interface EventDetailPageProps {
  params: { id: string }
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = params
  const event = MOCK_EVENTS.find((e) => e.id === id) || MOCK_EVENTS[0]

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
      <Link href="/events" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-emerald transition-colors uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a eventos</span>
      </Link>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ficha de Detalles */}
        <div className="lg:col-span-2 space-y-6">
          <Card hoverEffect={false} className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                {event.category}
              </span>
              <h1 className="text-2xl font-extrabold uppercase font-display text-slate-800 tracking-wide leading-tight">
                {event.title}
              </h1>
              <p className="text-xs text-slate-500 font-semibold uppercase leading-normal">
                Organizado por: {event.organizer}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                Descripción del Evento
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {event.desc}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {event.details}
              </p>
            </div>
          </Card>
        </div>

        {/* Tarjeta de Acción */}
        <div>
          <Card hoverEffect={false} className="space-y-6">
            <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider text-center">
              Datos del Evento
            </h3>
            
            <div className="space-y-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Fecha: {event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Hora: {event.time}</span>
              </div>
              <div className="flex items-start gap-2">
                {event.category === 'Virtual' ? (
                  <Video className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                ) : (
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <span>Ubicación: {event.location}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              {isRegistered ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>¡Inscripción confirmada!</span>
                </div>
              ) : (
                <Button
                  onClick={handleRegister}
                  isLoading={isRegistering}
                  className="w-full h-12 text-sm uppercase tracking-wider font-bold"
                >
                  Inscribirme al Evento
                </Button>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
