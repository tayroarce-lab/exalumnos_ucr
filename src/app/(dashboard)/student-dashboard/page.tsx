'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import mascotaEstudianteImg from '@/images/mascota_estudiante.png'
import {
  Search,
  FileText,
  Monitor,
  ArrowRight,
  Calendar,
  Bell,
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

/* ─────────── Utils ─────────── */
function parseEventDateStr(dateString: string) {
  if (!dateString) return '---'
  try {
    const d = new Date(dateString)
    const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`
  } catch(e) {
    return '---'
  }
}


export default function StudentDashboardPage() {
  const { user, profile } = useProfile()
  const userName = profile?.full_name || user?.user_metadata?.nombre || 'Estudiante'

  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [activeBtn, setActiveBtn] = useState<string | null>(null)
  const [eventsData, setEventsData] = useState<any[]>([])

  useEffect(() => {
    async function fetchEvents() {
      const supabase = createClient()
      const { data } = await supabase.from('events').select('*').limit(3)
      if (data) setEventsData(data)
    }
    fetchEvents()
  }, [])

  const quickLinks = [
    {
      label: 'Buscar Empleos',
      description: 'Explora ofertas laborales de las empresas más prestigiosas del país.',
      link: '/jobs',
      icon: Search,
    },
    {
      label: 'Mis Aplicaciones',
      description: 'Monitorea el estado actual de tus procesos de selección de manera centralizada.',
      link: '/mis-aplicaciones',
      icon: FileText,
    },
    {
      label: 'Solicitar Mentoría',
      description: 'Recibe orientación directa de exalumnos expertos en tu campo laboral.',
      link: '/mentorships',
      icon: Monitor,
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FB' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6 space-y-12">

        {/* ═══════════════════════════════════════════════════════════
            HERO BANNER — Mascota + CTA (NO TOCAR)
        ═══════════════════════════════════════════════════════════ */}
        <section className="relative rounded-2xl overflow-hidden min-h-[340px] md:min-h-[400px]" style={{ backgroundColor: '#E8F4FD' }}>
          {/* Mascot image */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <Image
              src={mascotaEstudianteImg}
              alt="Mascota UCR Estudiantes"
              fill
              className="object-cover object-right-top"
              style={{ objectPosition: '65% 20%' }}
              priority
            />
          </div>

          {/* Gradient overlay for readability */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #E8F4FDee 0%, #E8F4FDcc 40%, transparent 70%)',
            }}
          />

          {/* Text content */}
          <div className="relative z-10 flex flex-col justify-center px-10 md:px-14 py-14 md:py-16 max-w-lg h-full min-h-[340px] md:min-h-[400px]">
            <h1
              className="text-[2.4rem] md:text-[2.8rem] leading-[1.1] font-extrabold tracking-tight"
              style={{ color: '#1A1A2E', fontFamily: "'Outfit', 'Inter', sans-serif" }}
            >
              Tu futuro empieza aquí
            </h1>
            <p
              className="mt-4 text-[0.95rem] leading-relaxed max-w-sm"
              style={{ color: '#3A3A4A' }}
            >
              Descubre oportunidades laborales y conéctate con
              mentores que acelerarán tu carrera profesional.
            </p>
            <div className="mt-7">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                style={{ backgroundColor: '#54BCEB' }}
              >
                Ver vacantes de empleo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ACCESO RÁPIDO — 3 tarjetas con borde celeste al seleccionar
        ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <h2
            className="text-xl font-bold"
            style={{ color: '#1A1A2E', fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            Acceso Rápido
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {quickLinks.map((item, idx) => {
              const Icon = item.icon
              const isSelected = selectedCard === idx
              return (
                <Link
                  key={idx}
                  href={item.link}
                  className="group"
                  onClick={() => setSelectedCard(idx)}
                >
                  <div
                    className="bg-white rounded-xl p-6 h-full flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                    style={{
                      border: isSelected
                        ? '2px solid #54BCEB'
                        : '1px solid #E8EAF0',
                      boxShadow: isSelected
                        ? '0 0 0 3px rgba(84, 188, 235, 0.15)'
                        : undefined,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isSelected ? '#EBF8FD' : '#F0F2F5',
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: isSelected ? '#54BCEB' : '#3A3A6A' }}
                      />
                    </div>

                    {/* Text */}
                    <div className="space-y-1.5 flex-1">
                      <h3
                        className="text-[0.9rem] font-bold transition-colors"
                        style={{
                          color: isSelected ? '#54BCEB' : '#1A1A2E',
                        }}
                      >
                        {item.label}
                      </h3>
                      <p
                        className="text-[0.8rem] leading-relaxed"
                        style={{ color: '#6B7280' }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            TU PROGRESO — Estadísticas + Imagen + Notificación
        ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <h2
            className="text-xl font-bold"
            style={{ color: '#1A1A2E', fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            Tu Progreso
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Stats + Notification */}
            <div className="flex flex-col gap-5">
              {/* Stats cards row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Aplicaciones */}
                <div
                  className="bg-white rounded-xl p-5 flex flex-col gap-1"
                  style={{ border: '1px solid #E8EAF0' }}
                >
                  <span
                    className="text-3xl font-extrabold"
                    style={{ color: '#54BCEB', fontFamily: "'Outfit', sans-serif" }}
                  >
                    12
                  </span>
                  <span
                    className="text-[0.7rem] font-bold uppercase tracking-widest"
                    style={{ color: '#6B7280' }}
                  >
                    Aplicaciones
                  </span>
                </div>
                {/* Mentorías */}
                <div
                  className="bg-white rounded-xl p-5 flex flex-col gap-1"
                  style={{ border: '1px solid #E8EAF0' }}
                >
                  <span
                    className="text-3xl font-extrabold"
                    style={{ color: '#54BCEB', fontFamily: "'Outfit', sans-serif" }}
                  >
                    03
                  </span>
                  <span
                    className="text-[0.7rem] font-bold uppercase tracking-widest"
                    style={{ color: '#6B7280' }}
                  >
                    Mentorías
                  </span>
                </div>
              </div>

              {/* Notification bar */}
              <div
                className="rounded-xl px-5 py-4 flex items-start gap-3"
                style={{ backgroundColor: '#EBF8FD', borderLeft: '4px solid #54BCEB' }}
              >
                <Bell className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#54BCEB' }} />
                <p className="text-[0.82rem] leading-snug" style={{ color: '#1A1A2E' }}>
                  <span className="font-bold" style={{ color: '#54BCEB' }}>Actualización:</span>{' '}
                  El mentor Luis G. ha revisado tu perfil profesional recientemente.
                </p>
              </div>
            </div>

            {/* Right: Decorative image */}
            <div className="relative rounded-xl overflow-hidden min-h-[220px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&h=450&fit=crop"
                alt="Espacio de trabajo profesional"
                className="w-full h-full object-cover rounded-xl"
                style={{ minHeight: '220px' }}
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            EVENTOS PRÓXIMOS — 3 tarjetas con imágenes
        ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-6 pb-10">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-bold"
              style={{ color: '#1A1A2E', fontFamily: "'Outfit', 'Inter', sans-serif" }}
            >
              Eventos Próximos
            </h2>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ color: '#54BCEB' }}
            >
              Ver calendario
              <Calendar className="w-4 h-4" />
            </Link>
          </div>

          {/* Event cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {eventsData.map((evento) => {
              const isActive = activeBtn === evento.id
              const isVirtual = evento.location?.toLowerCase().includes('virtual') || evento.location?.toLowerCase().includes('zoom')
              const imgUrl = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop'

              return (
                <div
                  key={evento.id}
                  className="bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ border: '1px solid #E8EAF0' }}
                >
                  {/* Event image */}
                  <div className="relative w-full h-44 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={evento.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Event content */}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    {/* Date + Type badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[0.68rem] font-bold uppercase tracking-wider"
                        style={{ color: '#54BCEB' }}
                      >
                        {parseEventDateStr(evento.event_date)}
                      </span>
                      <span style={{ color: '#D1D5DB' }}>·</span>
                      <span
                        className="text-[0.68rem] font-bold uppercase tracking-wider"
                        style={{ color: '#54BCEB' }}
                      >
                        {isVirtual ? 'VIRTUAL' : 'PRESENCIAL'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-[0.95rem] font-bold leading-snug"
                      style={{ color: '#1A1A2E' }}
                    >
                      {evento.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-[0.8rem] leading-relaxed flex-1"
                      style={{ color: '#6B7280' }}
                    >
                      {evento.description || evento.category}
                    </p>

                    {/* CTA Button */}
                    <button
                      onClick={() => setActiveBtn(evento.id)}
                      className="mt-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: isActive ? '#54BCEB' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#1A1A2E',
                        border: isActive ? '2px solid #54BCEB' : '2px solid #E8EAF0',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = '#54BCEB'
                          e.currentTarget.style.color = '#54BCEB'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = '#E8EAF0'
                          e.currentTarget.style.color = '#1A1A2E'
                        }
                      }}
                    >
                      {isActive ? 'Inscrito' : 'Inscribirse'}
                    </button>
                  </div>
                </div>
              )
            })}
            {eventsData.length === 0 && (
              <div className="col-span-3 text-sm text-slate-500 bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
                No hay eventos próximos programados en este momento.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
