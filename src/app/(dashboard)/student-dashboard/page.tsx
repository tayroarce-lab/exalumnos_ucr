'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import logoUCR from '@/images/Logo_UCR.png'
import {
  Briefcase,
  GraduationCap,
  FileText,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'

export default function StudentDashboardPage() {
  const currentDate = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const { user, profile } = useProfile()
  const userName = profile?.full_name || user?.user_metadata?.nombre || 'Estudiante'

  const quickLinks = [
    {
      label: 'Buscar Empleos',
      description: 'Explora vacantes publicadas por exalumnos UCR',
      link: '/jobs',
      icon: Briefcase,
      iconBg: 'bg-gradient-to-tr from-celeste to-esmeralda',
      color: 'text-esmeralda',
      borderColor: 'border-celeste/20 hover:border-celeste/60',
      shadowColor: 'hover:shadow-celeste/10',
    },
    {
      label: 'Mis Aplicaciones',
      description: 'Revisa el estado de tus postulaciones',
      link: '/mis-aplicaciones',
      icon: FileText,
      iconBg: 'bg-gradient-to-tr from-emerald-400 to-esmeralda',
      color: 'text-emerald-700',
      borderColor: 'border-emerald-100 hover:border-emerald-300',
      shadowColor: 'hover:shadow-emerald-500/10',
    },
    {
      label: 'Mentorías',
      description: 'Conecta con exalumnos que pueden guiarte',
      link: '/mentorships',
      icon: GraduationCap,
      iconBg: 'bg-gradient-to-tr from-violet-400 to-violet-600',
      color: 'text-violet-700',
      borderColor: 'border-violet-100 hover:border-violet-300',
      shadowColor: 'hover:shadow-violet-500/10',
    },
    {
      label: 'Red Alumni',
      description: 'Descubre profesionales graduados de UCR',
      link: '/network',
      icon: Users,
      iconBg: 'bg-gradient-to-tr from-amarillo to-naranja',
      color: 'text-naranja',
      borderColor: 'border-naranja/20 hover:border-naranja/40',
      shadowColor: 'hover:shadow-naranja/10',
    },
  ]

  const steps = [
    { step: '01', title: 'Completa tu perfil', desc: 'Agrega tus habilidades y proyecto de graduación', link: '/completar-perfil' },
    { step: '02', title: 'Explora vacantes', desc: 'Encuentra oportunidades según tu carrera', link: '/jobs' },
    { step: '03', title: 'Solicita una mentoría', desc: 'Conéctate con un profesional UCR', link: '/mentorships' },
  ]

  return (
    <div className="py-8 px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-celeste text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Portal de Crecimiento Profesional</span>
            </div>
            <h1 className="text-4xl font-extrabold uppercase font-display text-slate-800 tracking-wide">
              Portal Estudiante
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Bienvenido(a), <span className="font-bold text-esmeralda">{userName}</span>  · {currentDate}
            </p>
          </div>
        </div>

        {/* Banner con Gradiente y Diseño Moderno */}
        <div className="rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-xl text-white bg-gradient-to-br from-esmeralda via-[#093e50] to-celeste transition-all duration-500 hover:shadow-celeste/20 group">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 rounded-l-full hidden md:block transform translate-x-10 group-hover:translate-x-6 transition-transform duration-700" />
          <div className="absolute right-1/4 top-1/4 w-32 h-32 bg-celeste/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          
          <div className="space-y-5 md:max-w-md relative z-10">
            <span className="inline-block text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
              Plataforma UCR · Estudiantes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight uppercase font-display">
              Tu camino profesional empieza aquí.
            </h2>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              Conéctate directamente con exalumnos mentores, postula a vacantes exclusivas y consolida tu futuro.
            </p>
            <div className="pt-2">
              <Link href="/jobs" className="inline-block">
                <Button variant="primary" className="bg-white text-[#000000] hover:bg-celeste hover:text-white font-bold uppercase tracking-wider text-xs px-6 py-3 shadow-lg hover:shadow-celeste/30 hover:scale-105 active:scale-95 transition-all duration-300">
                  Ver vacantes disponibles →
                </Button>
              </Link>
            </div>
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

        {/* Accesos Rápidos */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
            <span className="w-2 h-6 bg-celeste rounded-full" />
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((item, idx) => {
              const Icon = item.icon
              return (
                <Link key={idx} href={item.link}>
                  <Card hoverEffect className={`flex flex-col items-center text-center p-6 space-y-4 bg-white/90 backdrop-blur-sm border ${item.borderColor} shadow-sm hover:shadow-xl ${item.shadowColor} transition-all duration-300 rounded-2xl cursor-pointer group`}>
                    <div className={`w-14 h-14 rounded-2xl ${item.iconBg} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <span className={`text-sm font-bold block ${item.color} tracking-wide group-hover:text-celeste transition-colors`}>{item.label}</span>
                      <span className="text-[11px] text-slate-500 block leading-snug font-medium">{item.description}</span>
                    </div>
                    <div className="pt-2">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-celeste group-hover:text-white transition-colors duration-300`}>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Pasos para comenzar */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
            <span className="w-2 h-6 bg-esmeralda rounded-full" />
            ¿Por dónde empezar?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s) => (
              <Link key={s.step} href={s.link}>
                <Card hoverEffect className="p-6 bg-white border border-slate-200/75 rounded-2xl shadow-sm hover:shadow-xl hover:border-celeste/30 transition-all duration-300 space-y-3 cursor-pointer group">
                  <span className="text-4xl font-black text-celeste/20 font-display group-hover:text-celeste/40 transition-colors duration-300 block">{s.step}</span>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide group-hover:text-esmeralda transition-colors">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{s.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

