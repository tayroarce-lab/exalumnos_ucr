'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import { Search, Star, GraduationCap } from 'lucide-react'

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
    initials: 'CS',
    avatarBg: 'bg-blue-700'
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
    initials: 'LR',
    avatarBg: 'bg-indigo-600'
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
    initials: 'EV',
    avatarBg: 'bg-sky-600'
  }
]

export default function MentorshipsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMentors = MOCK_MENTORS.filter((mentor) => {
    return (
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-10 px-6 lg:px-10 relative overflow-hidden">
      {/* Decorativos de fondo */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute left-10 bottom-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-2xl -z-10"></div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-2 pt-2">
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">
            Directorio de Mentores
          </h1>
          <p className="text-sm text-slate-700 font-medium max-w-2xl leading-relaxed">
            Conéctate con graduados experimentados dispuestos a guiar tu desarrollo profesional.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por especialidad (ej. AWS, Scrum) o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-transparent rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Grid de Mentores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <Card key={mentor.id} hoverEffect={true} className="flex flex-col justify-between space-y-6 bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl p-6">
                <div className="space-y-4">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full ${mentor.avatarBg} text-white font-bold font-display text-lg flex items-center justify-center shadow-md shrink-0`}>
                      {mentor.initials}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wide leading-snug">
                        {mentor.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-700">
                        {mentor.role} en {mentor.company}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{mentor.rating}</span>
                        <span className="text-slate-500 font-medium ml-1">({mentor.sessions} sesiones)</span>
                      </div>
                    </div>
                  </div>

                  {/* Carrera y cita */}
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                      <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                      {mentor.degree}
                    </p>
                    <p className="italic text-xs text-slate-500 leading-relaxed line-clamp-2">
                      "{mentor.quote}"
                    </p>
                  </div>
                </div>

                {/* Skills + CTA */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.skills.map((skill, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <Link href={`/mentorships/${mentor.id}`}>
                    <span className="block text-center text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors uppercase tracking-wider pt-2 cursor-pointer">
                      Ver Perfil del Mentor →
                    </span>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500 font-medium text-sm">
              No se encontraron mentores disponibles.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
