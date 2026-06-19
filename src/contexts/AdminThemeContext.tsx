'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type AdminTheme = 'dark' | 'light'

interface AdminThemeContextType {
  theme: AdminTheme
  toggleTheme: () => void
  isDark: boolean
}

// Valores por defecto seguros — no lanza si se usa fuera del Provider
const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  isDark: true,
})

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme') as AdminTheme | null
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('admin-theme', next)
      return next
    })
  }

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </AdminThemeContext.Provider>
  )
}

// Hook seguro — siempre retorna valores válidos aunque no haya Provider
export function useAdminTheme() {
  return useContext(AdminThemeContext)
}

