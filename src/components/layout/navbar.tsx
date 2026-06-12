'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronDown, User, LogOut, Briefcase } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, User, LogOut, Settings, BarChart3, Users, Briefcase, Heart, ShieldAlert, GraduationCap } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { createClient } from '@/lib/supabase/client'
import logoUCR from '@/images/Logo_UCR.png'

interface NavbarProps {
  onMenuToggle?: () => void
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile } = useProfile()

  // Estado para notificaciones
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nueva vacante publicada',
      desc: 'Se publicó "Desarrollador React" en tu área.',
      time: 'Hace 10 min',
      link: '/jobs'
    },
    {
      id: 2,
      title: 'Solicitud de mentoría',
      desc: 'Gabriel Brenes solicitó una sesión contigo.',
      time: 'Hace 2 horas',
      link: '/mentorships'
    },
    {
      id: 3,
      title: 'Donación recibida',
      desc: 'Tu donación al Fondo de Becas ha sido procesada.',
      time: 'Ayer',
      link: '/donations'
    }
  ])

  const { user, profile } = useProfile()
  
  const name = profile?.full_name || user?.user_metadata?.nombre || user?.user_metadata?.full_name || 'Usuario'
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const email = user?.email || 'usuario@ucr.ac.cr'
  const fotoUrl = profile?.foto_url || null

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('authToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    window.location.href = '/login'
  }

  // Lógica de contexto: Admin, Estudiantes, Exalumnos
  const isAdmin = pathname?.startsWith('/admin')
  const isStudent = pathname?.includes('/directorio/estudiantes') || profile?.es_exalumno === false

  // Configuración de estilo y botones por contexto
  let config = {
    bgClass: 'bg-[#F34B26] text-white shadow-md border-b border-white/10',
    linkHoverClass: 'hover:bg-white/10 hover:text-white',
    linkActiveClass: 'bg-white/20 text-white font-semibold',
    logoFilter: 'brightness(0) invert(1)',
    badgeClass: 'bg-white text-[#F34B26]',
    userCircleBg: 'bg-white/20 text-white',
    menuItems: [
      { name: 'Directorios', href: '/network' },
      { name: 'Donaciones', href: '/donations' },
      { name: 'Mentorías', href: '/mentorships' },
      { name: 'Eventos', href: '/events' },
      { name: 'Empleos', href: '/jobs' }
    ]
  }

  if (isAdmin) {
    config = {
      bgClass: 'bg-[#004C63] text-white shadow-md border-b border-white/10',
      linkHoverClass: 'hover:bg-white/10 hover:text-white',
      linkActiveClass: 'bg-white/20 text-white font-semibold',
      logoFilter: 'brightness(0) invert(1)',
      badgeClass: 'bg-[#54BCEB] text-[#004C63]',
      userCircleBg: 'bg-white/20 text-white',
      menuItems: [
        { name: 'Reportes', href: '/admin/reportes' },
        { name: 'Usuarios', href: '/admin/usuarios' },
        { name: 'Matches', href: '/admin/matches' },
        { name: 'Donaciones', href: '/admin/donaciones' },
        { name: 'Vacantes', href: '/admin/vacantes' }
      ]
    }
  } else if (isStudent) {
    config = {
      bgClass: 'bg-[#54BCEB] text-slate-800 shadow-md border-b border-[#004C63]/10',
      linkHoverClass: 'hover:bg-[#F34B26] hover:text-white',
      linkActiveClass: 'bg-[#F34B26] text-white font-semibold shadow-sm',
      logoFilter: 'brightness(0) contrast(2)', // Filtro para oscurecer el logo y lograr buen contraste
      badgeClass: 'bg-[#004C63] text-white',
      userCircleBg: 'bg-[#004C63]/10 text-slate-800',
      menuItems: [
        { name: 'Directorios', href: '/network' },
        { name: 'Mentorías', href: '/mentorships' },
        { name: 'Eventos', href: '/events' },
        { name: 'Empleos', href: '/jobs' }
      ]
    }
  }

  return (
    <header className={`h-16 w-full ${config.bgClass} flex items-center justify-between px-6 lg:px-8 shrink-0 transition-all duration-300 backdrop-blur-sm z-30`}>
      {/* Extremo izquierdo: Logo UCR */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
          <Image
            src={logoUCR}
            alt="Logo UCR"
            width={180}
            height={64}
            style={{ objectFit: 'contain', height: '92px', width: 'auto', filter: config.logoFilter }}
            className="transition-all duration-300"
            priority
          />
        </Link>

        {/* Navegación central (desktop) */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/network" className="text-sm font-semibold hover:text-blue-200 transition-colors py-5 border-b-2 border-transparent hover:border-blue-300">Directorios</Link>
          <Link href="/jobs" className="text-sm font-semibold hover:text-blue-200 transition-colors py-5 border-b-2 border-transparent hover:border-blue-300">Empleos</Link>
          <Link href="/donations" className="text-sm font-semibold hover:text-blue-200 transition-colors py-5 border-b-2 border-transparent hover:border-blue-300">Donaciones</Link>
          <Link href="/mentorships" className="text-sm font-semibold hover:text-blue-200 transition-colors py-5 border-b-2 border-transparent hover:border-blue-300">Mentorías</Link>
          <Link href="/events" className="text-sm font-semibold hover:text-blue-200 transition-colors py-5 border-b-2 border-transparent hover:border-blue-300">Eventos</Link>
        </nav>
      </div>

      {/* Centro: Botones de navegación contextuales */}
      <nav className="hidden lg:flex items-center gap-2">
        {config.menuItems.map((item, idx) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={idx}
              href={item.href}
              className={`text-xs uppercase tracking-wider font-bold px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive ? config.linkActiveClass : `text-current/80 ${config.linkHoverClass}`
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Extremo derecho: Notificaciones y Perfil */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-2 rounded-xl hover:bg-current/10 relative transition-colors`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className={`absolute top-1 right-1 w-4 h-4 ${config.badgeClass} text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse`}>
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-100 font-semibold font-display text-slate-800 uppercase tracking-wide text-xs">
                Notificaciones
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.link}
                      onClick={() => {
                        setIsNotificationsOpen(false)
                        setNotifications(prev => prev.filter(n => n.id !== notif.id))
                      }}
                      className="block px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-slate-500 font-medium">
                    No tienes notificaciones nuevas
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Perfil de Usuario */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:bg-current/10 p-1.5 rounded-xl transition-all active:scale-95 focus:outline-none"
          >
            {fotoUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-current shadow-sm">
                <img
                  src={fotoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-8 h-8 rounded-full ${config.userCircleBg} flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-sm border border-current/20`}>
                {initials}
              </div>
            )}
            <span className="text-xs font-bold hidden sm:inline uppercase tracking-wider">
              {name}
            </span>
            <ChevronDown className="w-4 h-4 opacity-80" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Sesión iniciada como</p>
                <p className="text-xs font-bold text-slate-800 truncate">{email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Mi Perfil</span>
              </Link>
              <Link
                href="/mis-posiciones"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-colors"
              >
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>Mis Posiciones</span>
              </Link>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
