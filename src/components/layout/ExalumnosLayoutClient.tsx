'use client'

import React, { useState, useEffect } from 'react'

export function ExalumnosLayoutClient({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Leer tema inicial desde localStorage
    const saved = localStorage.getItem('exalumnos-theme') as 'light' | 'dark' | null
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
    }

    // Escuchar cambios de tema desde el FloatingThemeToggle
    const handler = (e: Event) => {
      const next = (e as CustomEvent<'light' | 'dark'>).detail
      setTheme(next)
    }
    window.addEventListener('exalumnos-theme-change', handler)
    return () => window.removeEventListener('exalumnos-theme-change', handler)
  }, [])

  // Se aplica 'bg-negro-base' para modo noche y 'bg-cream' para diurno
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-negro-base exalumnos-theme-dark' : 'bg-cream exalumnos-theme-light'}`}>
      {children}
    </div>
  )
}
