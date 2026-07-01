'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import logoUCR from '@/images/Logo_UCR.png'
import {
  Users,
  Briefcase,
  Heart,
  GraduationCap,
  Calendar,
  MapPin,
  X
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import ProyectoDonacionesProgreso from '@/components/ProyectoDonacionesProgreso'
import { getProyectoFileUrl } from '@/lib/utils'

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

  const [proyectosApoyo, setProyectosApoyo] = React.useState<any[]>([])
  const [loadingProyectos, setLoadingProyectos] = React.useState(true)

  React.useEffect(() => {
    import('@/actions/students').then(({ obtenerProyectosBuscandoApoyo }) => {
      obtenerProyectosBuscandoApoyo(3).then((res) => {
        if (res.success && res.data) {
          setProyectosApoyo(res.data)
        }
        setLoadingProyectos(false)
      })
    })
  }, [])

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
            Bienvenido(a) de nuevo, <span className="font-bold text-[#F34B26]">{userName}</span>  · {currentDate}
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
              <Button variant="primary" className="bg-white !text-black hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all duration-300 font-bold uppercase tracking-wider text-xs px-6 shadow-md border-0">
                Ver vacantes disponibles →
              </Button>
            </Link>
          </div>

          <div className="relative w-full md:w-[420px] h-60 shrink-0">
            <Image
              src={logoUCR}
              alt="Logo UCR"
              fill
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              priority
            />
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

        {/* Proyectos Estudiantiles que Buscan Apoyo */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 font-display">
              Proyectos estudiantiles por apoyar
            </h2>
            <Link href="/directorio/estudiantes" className="text-xs font-bold text-[#F34B26] hover:text-[#C82A08] hover:underline uppercase tracking-wider transition-colors">
              Ver todos en directorio →
            </Link>
          </div>

          {loadingProyectos ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 h-64 animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="space-y-2 pt-4">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : proyectosApoyo.length === 0 ? (
            <Card hoverEffect={false} className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
              <GraduationCap className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-sm">No hay proyectos buscando apoyo actualmente</p>
              <p className="text-slate-400 text-xs mt-1">Vuelve más tarde para descubrir nuevas iniciativas estudiantiles.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {proyectosApoyo.map((proj) => (
                <Card key={proj.estudianteId} hoverEffect={true} className="flex flex-col bg-white border border-slate-100 rounded-3xl p-6 shadow-sm justify-between gap-5 hover:shadow-md transition-shadow">
                  <div className="space-y-3.5">
                    {/* Estudiante Cabecera */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-250 shrink-0">
                        {proj.fotoUrl ? (
                          <img src={getProyectoFileUrl(proj.fotoUrl) || ''} alt={proj.nombreCompleto} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#003B4F] font-black text-sm">{proj.nombreCompleto.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate uppercase">{proj.nombreCompleto}</h4>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{proj.carrera} · Sede {proj.sede}</p>
                      </div>
                    </div>

                    {/* Título & Desc del proyecto */}
                    <div className="space-y-1">
                      <h3 className="font-display font-extrabold text-sm text-[#003B4F] uppercase line-clamp-2 leading-snug" title={proj.proyectoTitulo}>
                        {proj.proyectoTitulo}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-medium">
                        {proj.proyectoDescripcion}
                      </p>
                    </div>

                    {/* Tipos de Apoyo Solicitado */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {proj.buscaFinanciamiento && (
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
                          💰 Economía
                        </span>
                      )}
                      {proj.buscaMentoria && (
                        <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-blue-100 flex items-center gap-0.5">
                          🎓 Mentoría
                        </span>
                      )}
                      {proj.buscaEmpleo && (
                        <span className="bg-orange-50 text-orange-700 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-orange-100 flex items-center gap-0.5">
                          💼 Empleo
                        </span>
                      )}
                      {proj.buscaPasantia && (
                        <span className="bg-violet-50 text-violet-700 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-violet-100 flex items-center gap-0.5">
                          👜 Pasantía
                        </span>
                      )}
                    </div>

                    {/* Si tiene meta financiera, mostrar mini barra de donaciones */}
                    {proj.buscaFinanciamiento && proj.proyectoValorMonto && (
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-50">
                        <ProyectoDonacionesProgreso 
                          proyectoId={proj.estudianteId} 
                          metaMonto={proj.proyectoValorMonto} 
                          metaMoneda={proj.proyectoValorMoneda || 'USD'}
                          mostrarBotonApoyar={false}
                        />
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 mt-auto">
                    <Link href={`/directorio/estudiantes/${proj.estudianteId}`} className="flex-1">
                      <Button variant="secondary" className="w-full text-[11px] font-bold py-2 rounded-xl text-center flex items-center justify-center h-9">
                        Detalles
                      </Button>
                    </Link>
                    {proj.buscaFinanciamiento ? (
                      <Link href={`/donations?proyecto_id=${proj.estudianteId}`} className="flex-1">
                        <Button variant="primary" className="w-full text-[11px] font-bold py-2 rounded-xl text-center bg-[#F34B26] hover:bg-[#C82A08] text-white flex items-center justify-center h-9 border-0">
                          Apoyar
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/directorio/estudiantes/${proj.estudianteId}`} className="flex-1">
                        <Button variant="primary" className="w-full text-[11px] font-bold py-2 rounded-xl text-center bg-[#003B4F] hover:bg-[#002735] text-white flex items-center justify-center h-9 border-0">
                          Ofrecer Apoyo
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
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
