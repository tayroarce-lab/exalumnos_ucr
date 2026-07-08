import React from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import { Calendar, MapPin, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

function getEventGradient(category: string) {
  if (category === 'Virtual') return { from: '#FF9B18', to: '#FFD000' }
  if (category === 'Presencial') return { from: '#F34B26', to: '#FF9B18' }
  return { from: '#E03A14', to: '#F34B26' }
}

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: events, error } = await supabase.from('events').select('*')
  
  const displayEvents = events || []

  return (
    <div className="bg-transparent min-h-screen py-10 relative overflow-hidden transition-colors duration-300">
      {/* Círculos decorativos */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-[#F34B26]/8 rounded-full blur-3xl -z-10"></div>
      <div className="absolute left-10 bottom-10 w-72 h-72 bg-[#FF9B18]/8 rounded-full blur-2xl -z-10"></div>

      <div className="space-y-10 max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wider">
            Cartelera de Eventos
          </h1>
          <p className="text-sm text-slate-700 font-medium max-w-2xl leading-relaxed">
            Participa en los congresos, webinars y reencuentros oficiales de la comunidad de graduados UCR.
          </p>
        </div>

        {/* Grid de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayEvents.map((event) => {
            const gradient = getEventGradient(event.category)
            return (
              <Card
                key={event.id}
                hoverEffect={true}
                className="flex flex-col justify-between p-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Cabecera con imagen */}
                <div
                  className="h-44 w-full relative flex items-end justify-start p-5 text-white overflow-hidden group/image"
                >
                  {/* Imagen de fondo */}
                  <img 
                    src={event.category === 'Virtual' ? 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop'} 
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                  />
                  {/* Overlay oscuro para legibilidad */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                  
                  <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10 border border-white/30">
                    {event.category || 'Evento'}
                  </span>
                  <h3 className="relative z-10 font-display font-extrabold text-base uppercase tracking-wide leading-snug drop-shadow-lg">
                    {event.title}
                  </h3>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-700 font-medium leading-relaxed line-clamp-3">
                      {event.description}
                    </p>
                    <div className="space-y-2.5 text-sm text-slate-800 font-semibold">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-[#F34B26] shrink-0" />
                        <span>{event.event_date} · {event.event_time}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        {event.category === 'Virtual' ? (
                          <Video className="w-4 h-4 text-[#F34B26] shrink-0 mt-0.5" />
                        ) : (
                          <MapPin className="w-4 h-4 text-[#F34B26] shrink-0 mt-0.5" />
                        )}
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <Link href={`/events/${event.id}`} className="block">
                      <span className="block text-center text-xs font-bold text-[#F34B26] hover:text-[#C82A08] transition-colors uppercase tracking-wider pt-2 cursor-pointer">
                        Ver Detalles 
                      </span>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
        
        {displayEvents.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            No hay eventos próximos en este momento.
          </div>
        )}
      </div>
    </div>
  )
}
