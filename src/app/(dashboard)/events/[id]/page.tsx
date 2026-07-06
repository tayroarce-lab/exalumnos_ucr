import React from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import { ArrowLeft, Calendar, MapPin, Video, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import RegisterEventButton from './RegisterEventButton'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: event, error } = await supabase.from('events').select('*').eq('id', id).single()

  if (error || !event) {
    return (
      <div className="space-y-6 text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700">Evento no encontrado</h2>
        <Link href="/events" className="inline-flex items-center gap-2 text-sm font-bold text-brand-emerald hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Volver a eventos
        </Link>
      </div>
    )
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
                {event.category || 'Evento'}
              </span>
              <h1 className="text-2xl font-extrabold uppercase font-display text-slate-800 tracking-wide leading-tight">
                {event.title}
              </h1>
              {event.organizer && (
                <p className="text-xs text-slate-500 font-semibold uppercase leading-normal">
                  Organizado por: {event.organizer}
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                Descripción del Evento
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {event.description}
              </p>
              {event.details && (
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {event.details}
                </p>
              )}
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
                <span>Fecha: {event.event_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Hora: {event.event_time}</span>
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
              <RegisterEventButton />
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
