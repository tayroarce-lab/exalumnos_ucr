'use client'

import React, { useState, useEffect } from 'react'

export function FloatingThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Sincronizar tema desde localStorage
    const saved = localStorage.getItem('exalumnos-theme')
    if (saved === 'dark') setTheme('dark')
    else setTheme('light')

    const handler = (e: Event) => {
      const next = (e as CustomEvent<'dark' | 'light'>).detail
      setTheme(next)
    }
    window.addEventListener('exalumnos-theme-change', handler)
    return () => window.removeEventListener('exalumnos-theme-change', handler)
  }, [])

  const handleToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('exalumnos-theme', next)
    setTheme(next)
    window.dispatchEvent(new CustomEvent('exalumnos-theme-change', { detail: next }))
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={theme === 'dark' ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      title={theme === 'dark' ? 'Modo Día' : 'Modo Noche'}
      className="fixed bottom-6 left-6 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg z-50 transition-transform hover:scale-110 active:scale-95"
      style={{
        backgroundColor: '#1B2A4A', // Color institucional oscuro o el color que aparece en la imagen
        color: '#FFFFFF'
      }}
    >
      N
    </button>
  )
}
