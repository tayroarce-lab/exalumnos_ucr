import React from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import { ArrowLeft, Star, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import MentorshipRequestModal from './MentorshipRequestModal'

interface MentorshipDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function MentorshipDetailPage({ params }: MentorshipDetailPageProps) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: mentor, error } = await supabase.from('mentors').select('*').eq('id', id).single()

  if (error || !mentor) {
    return (
      <div className="space-y-6 text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700">Mentor no encontrado</h2>
        <Link href="/mentorships" className="inline-flex items-center gap-2 text-sm font-bold text-brand-emerald hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Volver a mentores
        </Link>
      </div>
    )
  }

  const initial = mentor.name ? mentor.name.charAt(mentor.name.startsWith('Ing. ') || mentor.name.startsWith('Lic. ') ? 5 : 0).toUpperCase() : 'M'

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
                {initial}
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

            {mentor.skills && Array.isArray(mentor.skills) && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                  Especialidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
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

            <MentorshipRequestModal slots={mentor.slots || []} />
          </Card>
        </div>

      </div>
    </div>
  )
}
