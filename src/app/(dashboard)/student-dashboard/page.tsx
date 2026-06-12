'use client'

import React from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import {
  Briefcase,
  GraduationCap,
  FileText,
  Users,
  BookOpen,
  ArrowRight
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
      color: 'bg-blue-600',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Mis Aplicaciones',
      description: 'Revisa el estado de tus postulaciones',
      link: '/mis-aplicaciones',
      icon: FileText,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Mentorías',
      description: 'Conecta con exalumnos que pueden guiarte',
      link: '/mentorships',
      icon: GraduationCap,
      color: 'bg-violet-600',
      textColor: 'text-violet-700',
      borderColor: 'border-violet-100',
    },
    {
      label: 'Red Alumni',
      description: 'Descubre profesionales graduados de UCR',
      link: '/network',
      icon: Users,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-100',
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
        <div className="space-y-1 pt-2">
          <h1 className="text-4xl font-extrabold uppercase font-display text-institutional tracking-wide">
            Portal Estudiante
          </h1>
          <p className="text-sm font-medium text-slate-600">
            Bienvenido(a), <span className="font-bold text-institutional">{userName}</span> 👋 · {currentDate}
          </p>
        </div>

        {/* Banner */}
        <div className="rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-md text-white bg-institutional">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full hidden md:block" />
          <div className="absolute right-1/4 top-1/4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
          <div className="space-y-4 md:max-w-md relative z-10">
            <span className="inline-block text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">
              Plataforma UCR · Estudiantes
            </span>
            <h2 className="text-3xl font-black leading-tight uppercase font-display">
              Tu camino profesional empieza aquí.
            </h2>
            <p className="text-white/80 text-sm font-medium">
              Conecta con exalumnos, aplica a vacantes y accede a mentorías exclusivas.
            </p>
            <Link href="/jobs" className="inline-block pt-2">
              <Button variant="primary" className="bg-white text-institutional hover:bg-slate-100 font-bold uppercase tracking-wider text-xs px-6 shadow-md">
                Ver vacantes disponibles →
              </Button>
            </Link>
          </div>
          <div className="relative w-full md:w-64 h-40 rounded-2xl overflow-hidden shadow-lg shrink-0 flex items-center justify-center bg-white/10">
            <div className="text-center text-white/80 space-y-2">
              <BookOpen className="w-12 h-12 mx-auto opacity-80" />
              <div className="text-xs font-bold uppercase tracking-widest">UCR · Estudiantes 2026</div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 font-display">
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((item, idx) => {
              const Icon = item.icon
              return (
                <Link key={idx} href={item.link}>
                  <Card hoverEffect className={`flex flex-col items-center text-center p-6 space-y-4 bg-white border ${item.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl cursor-pointer`}>
                    <div className={`w-14 h-14 rounded-full ${item.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <span className={`text-sm font-bold block ${item.textColor}`}>{item.label}</span>
                      <span className="text-[11px] text-slate-500 block leading-snug">{item.description}</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${item.textColor}`} />
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Pasos para comenzar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 font-display">
            ¿Por dónde empezar?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s) => (
              <Link key={s.step} href={s.link}>
                <Card hoverEffect className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 space-y-3 cursor-pointer">
                  <span className="text-4xl font-black text-institutional/20 font-display">{s.step}</span>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
