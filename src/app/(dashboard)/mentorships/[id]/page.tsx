'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { Textarea } from '@/components/ui/input'
import { ArrowLeft, Star, Calendar, Clock, GraduationCap, Award, CheckCircle2 } from 'lucide-react'

const MOCK_MENTORS = [
  {
    id: '1',
    name: 'Ing. Carlos Salazar',
    role: 'Staff Engineer',
    company: 'Amazon Web Services',
    rating: 4.9,
    sessions: 42,
    degree: 'Ingeniería Eléctrica, UCR',
    skills: ['AWS', 'Cloud Architecture', 'Python', 'DevOps'],
    quote: 'Me apasiona guiar a estudiantes en la transición del ámbito académico al corporativo global.',
    bio: 'Más de 10 años diseñando e implementando arquitecturas en la nube. Graduado de la Escuela de Ingeniería Eléctrica de la UCR. Comprometido con la formación del talento costarricense.',
    slots: ['Lunes 2:00 PM', 'Miércoles 10:00 AM', 'Jueves 4:00 PM']
  },
  {
    id: '2',
    name: 'Lic. Laura Rodríguez',
    role: 'Product Manager',
    company: 'Fintech Solutions',
    rating: 4.7,
    sessions: 18,
    degree: 'Dirección de Empresas, UCR',
    skills: ['Scrum', 'Product Design', 'Agile', 'Finanzas'],
    quote: 'Apoyo a definir objetivos de carrera y metodologías ágiles en equipos multidisciplinarios.',
    bio: 'Especialista en gerencia de producto y metodologías ágiles en el sector financiero digital. Graduada de la Facultad de Ciencias Económicas de la UCR.',
    slots: ['Martes 9:00 AM', 'Jueves 2:00 PM', 'Viernes 11:00 AM']
  },
  {
    id: '3',
    name: 'M.Sc. Esteban Vargas',
    role: 'Data Scientist Lead',
    company: 'Intel Corporation',
    rating: 4.8,
    sessions: 29,
    degree: 'Matemáticas y Computación, UCR',
    skills: ['Data Science', 'Machine Learning', 'SQL', 'R/Python'],
    quote: 'Te ayudo a adentrarte en el mundo de la analítica avanzada y la inteligencia artificial práctica.',
    bio: 'Experto en modelos predictivos e inteligencia artificial para la optimización de procesos industriales. Exalumno de Matemáticas de la UCR.',
    slots: ['Lunes 10:00 AM', 'Miércoles 3:00 PM', 'Viernes 9:00 AM']
  }
]

interface MentorshipDetailPageProps {
  params: { id: string }
}

export default function MentorshipDetailPage({ params }: MentorshipDetailPageProps) {
  const { id } = params
  const mentor = MOCK_MENTORS.find((m) => m.id === id) || MOCK_MENTORS[0]

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [objective, setObjective] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleRequestSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setIsModalOpen(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <Link href="/mentorships" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-emerald transition-colors uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a mentores</span>
      </Link>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ficha del Mentor */}
        <div className="lg:col-span-2 space-y-6">
          <Card hoverEffect={false} className="space-y-6">
            <div className="flex items-start gap-4 flex-col sm:flex-row">
              <div className="w-16 h-16 rounded-full bg-brand-emerald text-white font-bold font-display text-2xl flex items-center justify-center shadow-inner shrink-0">
                {mentor.name.charAt(5)}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold uppercase font-display text-slate-800 tracking-wide">
                  {mentor.name}
                </h1>
                <p className="text-sm font-semibold text-brand-emerald">{mentor.role} en {mentor.company}</p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{mentor.rating} ({mentor.sessions} sesiones completadas)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                Sobre mí
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {mentor.bio}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                Educación
              </h3>
              <p className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                {mentor.degree}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                Especialidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Tarjeta de Agenda de Cita */}
        <div>
          <Card hoverEffect={false} className="space-y-6 text-center">
            <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
              Solicitar Mentoría
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reserva un espacio virtual para conversar sobre tu carrera y recibir retroalimentación.
            </p>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              {isSubmitted ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>¡Solicitud enviada!</span>
                </div>
              ) : (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-12 text-sm uppercase tracking-wider font-bold"
                >
                  Agendar Sesión
                </Button>
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* Modal de Agenda */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Mentoría"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleRequestSubmit}
              isLoading={isSubmitting}
              disabled={!selectedSlot || !objective}
            >
              Enviar Solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Seleccionar Horario Disponible
            </label>
            <div className="grid grid-cols-1 gap-2">
              {mentor.slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`h-11 px-4 rounded-xl text-xs font-bold uppercase border transition-colors flex items-center justify-between ${
                    selectedSlot === slot
                      ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{slot}</span>
                  <Clock className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Objetivo de la mentoría"
            placeholder="Describe brevemente tus dudas, qué deseas lograr en la sesión o los temas que te gustaría tratar con el mentor..."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
