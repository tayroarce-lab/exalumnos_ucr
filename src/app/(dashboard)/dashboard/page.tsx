'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useProfile } from '@/contexts/ProfileContext'
import { obtenerProyectosBuscandoApoyo } from '@/actions/students'
import heroBannerImg from '@/images/hero_banner_exact.png'
import {
  GraduationCap, Briefcase, DollarSign, Bell, ChevronRight,
  MapPin, Video, Type, Contrast, Mic, RotateCcw, Accessibility,
  X, ArrowRight, Users, BookOpen, Globe
} from 'lucide-react'

/* ─────────── Floating Accessibility Panel ─────────── */
function AccessibilityPanel() {
  const [open, setOpen] = useState(false)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal')
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('a11y') || '{}')
    if (saved.fontSize) setFontSize(saved.fontSize)
    if (saved.highContrast) setHighContrast(saved.highContrast)
  }, [])

  useEffect(() => {
    const sizes = { normal: '16px', large: '18px', xl: '20px' }
    document.documentElement.style.fontSize = sizes[fontSize]
    document.documentElement.classList.toggle('high-contrast', highContrast)
    localStorage.setItem('a11y', JSON.stringify({ fontSize, highContrast }))
  }, [fontSize, highContrast])

  const reset = () => { setFontSize('normal'); setHighContrast(false) }

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      {/* Trigger tab */}
      <button
        onClick={() => setOpen(o => !o)}
        className="bg-[#F34B26] text-white p-2 rounded-l-xl shadow-lg hover:bg-[#d93a1a] transition-colors"
        title="Accesibilidad"
      >
        <Accessibility className="w-5 h-5" />
      </button>

      {/* Panel */}
      <div className={`bg-white border border-slate-200 rounded-l-2xl shadow-2xl overflow-hidden transition-all duration-300 ${open ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}>
        <div className="p-5 space-y-4 w-64">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 text-sm">Accesibilidad</p>
              <p className="text-xs text-slate-500">Personaliza tu experiencia</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Font size */}
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Type className="w-4 h-4 text-[#F34B26]" />
              Tamaño de Texto
            </div>
            <div className="flex gap-1">
              {(['normal', 'large', 'xl'] as const).map(s => (
                <button key={s} onClick={() => setFontSize(s)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${fontSize === s ? 'bg-[#F34B26] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {s === 'normal' ? 'A' : s === 'large' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast */}
          <button onClick={() => setHighContrast(h => !h)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl border transition-all ${highContrast ? 'bg-[#F34B26]/10 border-[#F34B26] text-[#F34B26]' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Contrast className="w-4 h-4" />
              Contraste
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highContrast ? 'bg-[#F34B26]' : 'bg-slate-200'}`}>
              {highContrast && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>

          {/* Voice (decorative) */}
          <div className="flex items-center justify-between py-3 border-t border-slate-100 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voz
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>

          <button onClick={reset}
            className="w-full bg-[#F34B26] hover:bg-[#d93a1a] text-white text-sm font-bold py-2.5 rounded-xl transition-all active:scale-95">
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Restablecer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────── Animated Counter ─────────── */
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let start = 0
    const end = value
    const dur = 1200
    const step = end / (dur / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>
}

/* ─────────── Events Data ─────────── */
const EVENTS = [
  { id: '1', day: '15', month: 'NOV', title: 'Encuentro Anual de Exalumnos UCR', location: 'Auditorio Rodrigo Facio', virtual: false, img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80' },
  { id: '2', day: '22', month: 'NOV', title: 'Networking de Negocios', location: 'Virtual (Zoom)', virtual: true, img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80' },
  { id: '3', day: '05', month: 'DIC', title: 'Conferencia: Liderazgo en la Industria', location: 'Restaurante El Mirador', virtual: false, img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80' },
]

const NEWS = [
  { id: '1', category: 'INVESTIGACIÓN', title: 'Nuevo hito en nanotecnología biomédica', excerpt: 'Investigadores de la UCR logran desarrollar un parche inteligente para la regeneración...', img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=200&q=80' },
  { id: '2', category: 'VIDA ESTUDIANTIL', title: 'Inauguran nuevo Centro de Bienestar Estudiantil', excerpt: 'Un espacio dedicado a la salud mental y el desarrollo integral de la comunidad...', img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&q=80' },
]

/* ─────────── Main Dashboard ─────────── */
export default function DashboardPage() {
  const { user, profile } = useProfile()
  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Exalumno'
  const firstName = userName.split(' ')[0]

  const [mentorias] = useState(4)
  const [vacantes] = useState(2)

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <AccessibilityPanel />

      {/* ─── HERO ─── */}
      <section className="relative bg-[#FAF6F1] min-h-[380px] md:min-h-[420px] flex items-center overflow-hidden -ml-4 -mr-4 -mt-4 sm:-ml-6 sm:-mr-6 sm:-mt-6 lg:-ml-8 lg:-mr-8 lg:-mt-8 mb-8">
        {/* Exact pre-rendered banner image covering the ENTIRE background from left to right */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src={heroBannerImg}
            alt="Hero Illustration UCR"
            fill
            className="object-cover object-right md:object-center"
            priority
          />
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto w-full px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-8 relative z-10">

          {/* Left Text Block */}
          <div className="md:col-span-7 space-y-6 py-6">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-[1.1] tracking-tight font-display">
              Conecta, Participa y<br />
              Transforma
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-lg font-medium font-sans">
              Como exalumno de la UCR, tu legado continúa. Sé mentor de nuevas generaciones, apoya proyectos de investigación o revive momentos en nuestros eventos exclusivos.
            </p>
            <div className="flex items-center gap-4 flex-wrap pt-2">
              <Link href="/donations">
                <button className="bg-[#E65C00] hover:bg-[#cc5200] text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md active:scale-95 text-sm">
                  Donar Ahora
                </button>
              </Link>
              <Link href="/mentorships">
                <button className="border-2 border-[#E65C00]/80 text-[#E65C00] hover:bg-[#E65C00]/5 font-bold px-8 py-3.5 rounded-2xl transition-all active:scale-95 text-sm">
                  Ser Voluntario
                </button>
              </Link>
            </div>
          </div>

          {/* Right Spacer column (holds layout space so text doesn't overlap the mascot) */}
          <div className="md:col-span-5 h-[260px] md:h-full pointer-events-none" />

        </div>
      </section>

      {/* ─── METRIC CARDS ─── */}
      <section className="px-6 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Mentorías */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[#F34B26]/10 rounded-xl">
                <GraduationCap className="w-6 h-6 text-[#F34B26]" />
              </div>
              <span className="text-3xl font-black text-[#F34B26]">
                <AnimatedNumber value={mentorias} prefix="0" />
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Mentorías<br />Brindadas</h3>
            <p className="text-slate-500 text-xs mt-1">Has guiado a 4 estudiantes de Ingeniería y Artes este semestre.</p>
            <div className="flex items-center gap-1 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F34B26] to-[#FF9B18] border-2 border-white -ml-1 first:ml-0 flex items-center justify-center text-white text-[9px] font-bold shadow">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white -ml-1 flex items-center justify-center text-slate-500 text-[9px] font-bold shadow">+1</div>
            </div>
          </div>

          {/* Donaciones */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-3xl font-black text-[#F34B26]">$1.2k</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Donaciones<br />Realizadas</h3>
            <p className="text-slate-500 text-xs mt-1">Tu aporte ha impactado a 15 becados este año.</p>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Meta anual</span><span className="text-[#F34B26] font-bold">62%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-[#F34B26] to-[#FF9B18] h-2.5 rounded-full transition-all duration-1000" style={{ width: '62%' }} />
              </div>
            </div>
          </div>

          {/* Vacantes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-black text-[#F34B26]">
                <AnimatedNumber value={vacantes} prefix="0" />
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Publicar<br />Vacante</h3>
            <p className="text-slate-500 text-xs mt-1">Comparte oportunidades con la nueva generación universitaria.</p>
            <Link href="/jobs" className="inline-flex items-center gap-1 text-[#F34B26] text-xs font-bold mt-4 hover:gap-2 transition-all">
              Gestionar vacantes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PRÓXIMOS EVENTOS ─── */}
      <section className="px-6 lg:px-16 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Próximos Eventos</h2>
              <p className="text-slate-500 text-sm mt-0.5">No pierdas la oportunidad de reconectar.</p>
            </div>
            <Link href="/events" className="text-[#F34B26] text-sm font-bold hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EVENTS.map(ev => (
              <Link key={ev.id} href={`/events/${ev.id}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden h-52 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <img src={ev.img} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Date badge */}
                  <div className="absolute top-3 left-3 bg-[#F34B26] text-white rounded-xl px-3 py-1.5 text-center shadow-lg">
                    <div className="text-xl font-black leading-none">{ev.day}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">{ev.month}</div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-white font-bold text-sm leading-snug">{ev.title}</h4>
                    <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                      {ev.virtual ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {ev.location}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ACTUALIDAD UNIVERSITARIA ─── */}
      <section className="px-6 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Actualidad Universitaria</h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* News list */}
            <div className="lg:col-span-3 space-y-6">
              {NEWS.map(n => (
                <div key={n.id} className="flex gap-4 group cursor-pointer hover:bg-white/60 p-3 rounded-xl transition-all">
                  <img src={n.img} alt={n.title} className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="text-[#F34B26] text-[10px] font-black uppercase tracking-widest">{n.category}</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1 leading-snug group-hover:text-[#F34B26] transition-colors">{n.title}</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{n.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sabías que */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 h-full border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-4">¿Sabías que...?</h3>
                  <blockquote className="text-slate-600 text-sm leading-relaxed italic border-l-4 border-[#F34B26] pl-4">
                    "El 40% de nuestros graduados este año contaron con el apoyo de un mentor alumni. Tu experiencia es el recurso más valioso que podemos ofrecer."
                  </blockquote>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F34B26]/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#F34B26]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Fundación Exalumnos UCR</p>
                    <p className="text-xs text-slate-400">San José, Costa Rica</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Float animation keyframe via style tag */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
      `}</style>
    </div>
  )
}
