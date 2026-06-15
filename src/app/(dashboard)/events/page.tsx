'use client'

import React from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import { Calendar, MapPin, Video } from 'lucide-react'

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Encuentro Anual de Egresados 2026',
    category: 'Presencial',
    date: '15 de Junio, 2026',
    time: '6:00 PM - 9:00 PM',
    location: 'Auditorio Abelardo Bonilla, Sede Rodrigo Facio, UCR',
    desc: 'Un espacio de reencuentro, networking y discusión sobre las tendencias tecnológicas y económicas en Costa Rica.',
    gradientFrom: '#F34B26',
    gradientTo: '#FF9B18',
  },
  {
    id: '2',
    title: 'Webinar: Inteligencia Artificial en Modelos de Negocio',
    category: 'Virtual',
    date: '20 de Junio, 2026',
    time: '10:00 AM - 12:00 PM',
    location: 'Transmisión en Vivo (Zoom)',
    desc: 'Aprende cómo las corporaciones modernas integran modelos generativos para optimizar sus procesos de desarrollo y marketing.',
    gradientFrom: '#FF9B18',
    gradientTo: '#FFD000',
  },
  {
    id: '3',
    title: 'Congreso de Innovación y Sostenibilidad',
    category: 'Presencial',
    date: '05 de Julio, 2026',
    time: '8:30 AM - 4:30 PM',
    location: 'Aula Magna, Ciudad de la Investigación, UCR',
    desc: 'Charlas magistrales con expertos internacionales y presentación de TFGs estudiantiles con enfoque sostenible.',
    gradientFrom: '#E03A14',
    gradientTo: '#F34B26',
  }
]

export default function EventsPage() {
  return (
    <div className="bg-gradient-to-b from-slate-100 to-white min-h-screen py-10 relative overflow-hidden">
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
          {MOCK_EVENTS.map((event) => (
            <Card
              key={event.id}
              hoverEffect={true}
              className="flex flex-col justify-between p-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Cabecera con gradiente real */}
              <div
                className="h-44 w-full relative flex items-end justify-start p-5 text-white"
                style={{
                  background: `linear-gradient(135deg, ${event.gradientFrom}, ${event.gradientTo})`
                }}
              >
                {/* Overlay oscuro para legibilidad */}
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute top-4 left-4 bg-white/25 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                  {event.category}
                </span>
                <h3 className="relative z-10 font-display font-extrabold text-base uppercase tracking-wide leading-snug drop-shadow-md">
                  {event.title}
                </h3>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <p className="text-sm text-slate-700 font-medium leading-relaxed line-clamp-3">
                    {event.desc}
                  </p>
                  <div className="space-y-2.5 text-sm text-slate-800 font-semibold">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#F34B26] shrink-0" />
                      <span>{event.date} · {event.time}</span>
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
                      Ver Detalles →
                    </span>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
