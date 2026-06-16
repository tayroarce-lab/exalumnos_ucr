'use client'

import React from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import {
  Users,
  Briefcase,
  Heart,
  GraduationCap,
  Calendar,
  MapPin
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'

// Aplica un gradiente dinámico via ref para evitar estilos inline en JSX
function GradientBox({
  from, to, className, children,
}: {
  from: string; to: string; className?: string; children?: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.background = `linear-gradient(135deg, ${from}, ${to})`
    }
  }, [from, to])
  return <div ref={ref} className={className}>{children}</div>
}

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const { user, profile } = useProfile()
  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Exalumno'

  const quickSummary = [
    {
      label: 'Próximos eventos',
      value: '3',
      link: '/events',
      linkLabel: 'Ver eventos',
      icon: Users,
      iconBg: 'bg-[#F34B26]/10 text-[#F34B26] border border-[#F34B26]/20',
      valueBg: 'text-[#F34B26]'
    },
    {
      label: 'Vacantes disponibles',
      value: '3',
      link: '/jobs',
      linkLabel: 'Ver empleo',
      icon: Briefcase,
      iconBg: 'bg-[#FF9B18]/10 text-[#FF9B18] border border-[#FF9B18]/20',
      valueBg: 'text-[#FF9B18]'
    },
    {
      label: 'Fondos activos',
      value: '2',
      link: '/donations',
      linkLabel: 'Ver donaciones',
      icon: Heart,
      iconBg: 'bg-[#E03A14]/10 text-[#E03A14] border border-[#E03A14]/20',
      valueBg: 'text-[#E03A14]'
    },
    {
      label: 'Mentores disponibles',
      value: '3',
      link: '/mentorships',
      linkLabel: 'Ver mentorías',
      icon: GraduationCap,
      iconBg: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20',
      valueBg: 'text-[#FF7A00]'
    }
  ]

  const upcomingEvents = [
    {
      id: '1',
      title: 'Encuentro Anual de Exalumnos',
      location: 'Campus Rodrigo Facio',
      time: '09:00 AM',
      date: '24',
      month: 'MAY',
      gradientFrom: '#F34B26',
      gradientTo: '#FF9B18',
      virtual: false
    },
    {
      id: '2',
      title: 'Taller: Liderazgo e Innovación',
      location: 'Modalidad virtual',
      time: '04:00 PM',
      date: '15',
      month: 'JUN',
      gradientFrom: '#FF9B18',
      gradientTo: '#FFD000',
      virtual: true
    },
    {
      id: '3',
      title: 'Feria de Empleo UCR',
      location: 'Plaza 24 de Abril',
      time: '10:00 AM',
      date: '30',
      month: 'JUN',
      gradientFrom: '#E03A14',
      gradientTo: '#F34B26',
      virtual: false
    }
  ]

  return (
    <div className="py-8 px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Encabezado Principal */}
        <div className="space-y-1 pt-2">
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-850 tracking-wide">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-600">
            Bienvenido(a) de nuevo, <span className="font-bold text-[#F34B26]">{userName}</span> 👋 · {currentDate}
          </p>
        </div>

        {/* Banner Principal */}
        <div className="rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-md text-white bg-gradient-to-br from-[#E03A14] via-[#F34B26] to-[#FF9B18]">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full hidden md:block" />
          <div className="absolute right-1/4 top-1/4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />

          <div className="space-y-4 md:max-w-md relative z-10">
            <span className="inline-block text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">
              Red de Exalumnos UCR
            </span>
            <h2 className="text-3xl font-black leading-tight uppercase font-display">
              Conecta, participa y transforma.
            </h2>
            <p className="text-white/80 text-sm font-medium">
              Sigue formando parte del cambio desde donde estés.
            </p>
            <Link href="/jobs" className="inline-block pt-2">
              <Button variant="primary" className="bg-white text-[#F34B26] hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all duration-300 font-bold uppercase tracking-wider text-xs px-6 shadow-md border-0">
                Explorar oportunidades →
              </Button>
            </Link>
          </div>

          {/* Imagen decorativa con gradiente */}
          <div className="dashboard-banner-overlay relative w-full md:w-72 h-44 rounded-2xl overflow-hidden shadow-lg shrink-0 flex items-center justify-center">
            <div className="text-center text-white/90 space-y-2">
              <div className="text-5xl font-black font-display">UCR</div>
              <div className="text-xs font-bold uppercase tracking-widest">Exalumnos · 2026</div>
            </div>
          </div>
        </div>

        {/* Resumen Rápido */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 font-display">
            Resumen rápido
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickSummary.map((item, idx) => {
              const Icon = item.icon
              return (
                <Card key={idx} hoverEffect={false} className="dashboard-card-hover flex flex-col items-center text-center p-6 space-y-4 bg-white border border-slate-100 shadow-sm rounded-2xl">
                  <div className={`w-14 h-14 rounded-full ${item.iconBg} flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <span className={`text-3xl font-black block ${item.valueBg}`}>
                      {item.value}
                    </span>
                  </div>
                  <Link href={item.link} className="text-xs font-bold text-[#F34B26] hover:text-[#C82A08] hover:underline uppercase tracking-wider block pt-1 transition-colors">
                    {item.linkLabel} →
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 font-display">
              Próximos eventos
            </h2>
            <Link href="/events" className="text-xs font-bold text-[#F34B26] hover:text-[#C82A08] hover:underline uppercase tracking-wider transition-colors">
              Ver todos →
            </Link>
          </div>

          <Card hoverEffect={false} className="divide-y divide-slate-100 p-0 overflow-hidden border border-slate-150 rounded-2xl shadow-sm">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-5 hover:bg-orange-50/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  {/* Cuadro de Fecha con color real */}
                  <GradientBox
                    from={event.gradientFrom}
                    to={event.gradientTo}
                    className="w-14 h-14 rounded-xl text-white flex flex-col items-center justify-center shrink-0 shadow-md"
                  >
                    <span className="text-lg font-black font-display leading-none">{event.date}</span>
                    <span className="text-[9px] font-bold tracking-wider leading-none mt-1">{event.month}</span>
                  </GradientBox>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      {event.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                      {event.virtual
                        ? <Calendar className="w-3.5 h-3.5 text-[#F34B26] shrink-0" />
                        : <MapPin className="w-3.5 h-3.5 text-[#F34B26] shrink-0" />
                      }
                      {event.location} · {event.time}
                    </p>
                  </div>
                </div>

                <Link href={`/events/${event.id}`}>
                  <Button
                    variant="secondary"
                    className="border-[#F34B26] text-[#F34B26] hover:bg-orange-50/40 hover:scale-105 active:scale-95 transition-all duration-300 font-bold uppercase tracking-wider text-xs px-5 self-start sm:self-center"
                  >
                    Inscribirme
                  </Button>
                </Link>
              </div>
            ))}
          </Card>
        </div>

      </div>
    </div>
  )
}
