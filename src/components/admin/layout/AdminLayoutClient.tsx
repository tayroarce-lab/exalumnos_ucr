'use client'

import React, { useState, useEffect } from 'react'

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    // Leer tema inicial desde localStorage
    const saved = localStorage.getItem('admin-theme') as 'dark' | 'light' | null
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
    }

    // Escuchar cambios de tema desde el navbar (o cualquier otra fuente)
    const handler = (e: Event) => {
      const next = (e as CustomEvent<'dark' | 'light'>).detail
      setTheme(next)
    }
    window.addEventListener('admin-theme-change', handler)
    return () => window.removeEventListener('admin-theme-change', handler)
  }, [])

  return (
    <div className={`admin-layout ${theme === 'light' ? 'admin-light' : ''}`}>
      <div className="admin-main-content">
        {children}
      </div>
    </div>
  )
}

