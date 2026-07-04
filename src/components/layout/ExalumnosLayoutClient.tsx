'use client'

import React, { useState, useEffect } from 'react'
import InteractiveTour from '@/components/InteractiveTour'

export function ExalumnosLayoutClient({ children, role }: { children: React.ReactNode, role?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const isStudent = role === 'estudiante'
    const storageKey = isStudent ? 'student-theme' : 'exalumnos-theme'
    const eventName = isStudent ? 'student-theme-change' : 'exalumnos-theme-change'

    // Leer tema inicial desde localStorage
    const saved = localStorage.getItem(storageKey) as 'light' | 'dark' | null
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
    }

    // Escuchar cambios de tema desde el Navbar
    const handler = (e: Event) => {
      const next = (e as CustomEvent<'light' | 'dark'>).detail
      setTheme(next)
    }
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
  }, [role])

  // Se aplica 'bg-negro-base' para modo noche y 'bg-cream' para diurno
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-negro-base exalumnos-theme-dark' : 'bg-cream exalumnos-theme-light'}`}>
      {children}
      <InteractiveTour />
    </div>
  )
}
