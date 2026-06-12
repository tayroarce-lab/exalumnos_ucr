'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  onMenuToggle?: () => void
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

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

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('authToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    window.location.href = '/login'
  }

  return (
    <header className="h-16 w-full bg-institutional text-white flex items-center justify-between px-6 lg:px-8 shrink-0 shadow-md">
      {/* Lado izquierdo: Logo */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-serif font-black text-white text-lg leading-none tracking-wide">
              Exalumnos
            </span>
            <span className="font-serif font-bold text-white/80 text-sm leading-none tracking-widest mt-0.5">
              UCR
            </span>
          </div>
        </Link>

        {/* Navegación central (desktop) */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/network" className="text-sm font-semibold hover:text-blue-200 transition-colors py-5 border-b-2 border-transparent hover:border-blue-300">Directorios</Link>
          <Link href="/donations" className="text-sm font-semibold hover:text-blue-200 transition-colors py-5 border-b-2 border-transparent hover:border-blue-300">Donaciones</Link>
          <Link href="/mentorships" className="text-sm font-semibold hover:text-blue-200 transition-colors py-5 border-b-2 border-transparent hover:border-blue-300">Mentorías</Link>
          <Link href="/events" className="text-sm font-semibold hover:text-blue-200 transition-colors py-5 border-b-2 border-transparent hover:border-blue-300">Eventos</Link>
        </nav>
      </div>

      {/* Lado derecho: Búsqueda, Notificaciones y Perfil */}
      <div className="flex items-center gap-4 ml-auto">
        
        {/* Búsqueda rápida (opcional visual) */}
        <div className="hidden md:flex items-center bg-white/10 rounded-full px-3 py-1.5 border border-white/20">
          <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Buscar exalumnos..." className="bg-transparent border-none text-xs text-white placeholder:text-white/60 focus:outline-none w-32 focus:w-48 transition-all ml-2" />
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-full text-white/80 hover:bg-white/10 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50 text-slate-800">
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
            className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-white text-institutional flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-sm">
              {initials}
            </div>
            <span className="text-xs font-bold text-white hidden sm:inline uppercase tracking-wider">
              {name}
            </span>
            <ChevronDown className="w-4 h-4 text-white/80 hidden sm:block" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50 text-slate-800">
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
