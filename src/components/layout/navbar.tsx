'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react'

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

  const [user, setUser] = useState({
    name: 'Exalumno',
    email: 'usuario@ucr.ac.cr',
    initials: 'EX'
  })

  React.useEffect(() => {
    const storedName = localStorage.getItem('userName')
    const storedEmail = localStorage.getItem('userEmail')
    if (storedName || storedEmail) {
      const name = storedName || 'Exalumno'
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      setUser({
        name,
        email: storedEmail || 'usuario@ucr.ac.cr',
        initials
      })
    }
  }, [])

  return (
    <header className="h-16 w-full bg-slate-50 flex items-center justify-between px-6 lg:px-8 shrink-0">
      {/* Lado izquierdo: Botón menú móvil (oculto en escritorio) */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Lado derecho: Notificaciones y Perfil */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50">
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
                        // Remover notificación de la lista
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
            {/* Foto de perfil con iniciales reales */}
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-blue-700 uppercase">
              {user.initials}
            </div>
            <span className="text-xs font-bold text-slate-700 hidden sm:inline uppercase tracking-wider">
              {user.name}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Sesión iniciada como</p>
                <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
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
                href="/profile/edit"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Configuración</span>
              </Link>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  localStorage.removeItem('authToken')
                  localStorage.removeItem('userName')
                  localStorage.removeItem('userEmail')
                  window.location.href = '/login'
                }}
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
