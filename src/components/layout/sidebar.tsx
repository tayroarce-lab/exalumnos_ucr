'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  Briefcase,
  Heart,
  Users,
  HandHeart,
  Calendar,
  X,
  LogOut,
  BookUser,
  BookOpen
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard',        href: '/dashboard',   icon: LayoutDashboard },
    { name: 'Mi Perfil',        href: '/profile',     icon: User },
    { name: 'Directorio',       href: '/network',     icon: BookUser },
    { name: 'Empleo',           href: '/jobs',        icon: Briefcase },
    { name: 'Donaciones',       href: '/donations',   icon: Heart },
    { name: 'Mentorías',        href: '/mentorships', icon: Users },
    { name: 'Retribuir Capital',href: '/give-back',   icon: HandHeart },
    { name: 'Eventos',          href: '/events',      icon: Calendar },
    { name: 'Talleres',         href: '/mis-talleres',icon: BookOpen },
  ]

  const checkActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-brand-blue text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
          {/* Logo Corporativo */}
          <div className="px-6 flex items-center justify-between mb-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-white text-brand-blue rounded-full w-9 h-9 font-black font-display text-base shadow-md shrink-0">
                UCR
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-white text-base leading-none uppercase tracking-widest">
                  Exalumnos
                </span>
                <span className="font-display font-bold text-brand-celeste text-sm leading-none uppercase tracking-widest mt-0.5">
                  UCR
                </span>
              </div>
            </Link>

            {/* Botón de cerrar para móvil */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 px-4 space-y-1.5">
            {menuItems.map((item, idx) => {
              const Icon = item.icon
              const isActive = checkActive(item.href)

              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-celeste text-white shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/70'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer: Cerrar Sesión */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem('authToken')
              window.location.href = '/loginMariel'
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-colors text-left"
          >
            <LogOut className="w-5 h-5 text-white/70" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
