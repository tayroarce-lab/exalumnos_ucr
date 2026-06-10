'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, HelpCircle, ShieldCheck } from 'lucide-react'
import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Guardar token de sesión simulado
    localStorage.setItem('authToken', 'mock-token')
    
    // Generar nombre a partir del correo para simular perfil
    const namePart = email.split('@')[0]
    const formattedName = namePart.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    localStorage.setItem('userName', formattedName)
    localStorage.setItem('userEmail', email)

    // Redirigir al dashboard
    window.location.href = '/dashboard'
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between py-12 px-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute left-10 bottom-10 w-72 h-72 bg-brand-celeste/5 rounded-full blur-2xl -z-10"></div>

      {/* Spacer para empujar el contenido al centro */}
      <div></div>

      {/* Contenedor del Formulario */}
      <div className="w-full max-w-[480px] mx-auto space-y-8 z-10">
        <div className="bg-white p-8 sm:p-10 rounded-[28px] border border-slate-200/60 shadow-xl shadow-slate-100/50 space-y-6">
          {/* Cabecera */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800 font-display uppercase tracking-wide">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm text-slate-500 font-semibold">
              Accede a tu red global de exalumnos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Correo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Correo Electrónico Personal
              </label>
              <Input
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-slate-200 focus:border-brand-blue bg-slate-50/50 rounded-xl placeholder:text-slate-400 text-sm font-medium"
              />
            </div>

            {/* Input Contraseña */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Contraseña
                </label>
                <Link href="/forgot-password">
                  <span className="text-[11px] font-bold text-brand-blue hover:text-brand-celeste transition-colors">
                    ¿Olvidaste tu contraseña?
                  </span>
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-slate-200 focus:border-brand-blue bg-slate-50/50 rounded-xl pr-10 placeholder:text-slate-400 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mantener Sesión Iniciada */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
              />
              <label htmlFor="remember" className="text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none">
                Mantener sesión iniciada
              </label>
            </div>

            {/* Botón Ingresar */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full h-12 bg-brand-celeste hover:bg-brand-celeste/95 text-white font-bold uppercase tracking-wider text-sm rounded-xl mt-3 shadow-md shadow-brand-celeste/10"
            >
              Iniciar sesión →
            </Button>
          </form>

          {/* Registro */}
          <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/registerMariel">
              <span className="font-bold text-brand-blue hover:text-brand-celeste transition-colors">
                Regístrate
              </span>
            </Link>
          </div>
        </div>

        {/* Tarjetas de Soporte inferiores */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/help" className="flex items-center justify-center gap-2.5 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm hover:shadow transition-shadow">
            <HelpCircle className="w-4 h-4 text-brand-blue" />
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Centro de Ayuda
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2.5 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Acceso Seguro
            </span>
          </div>
        </div>
      </div>

      {/* Footer corporativo de la página de auth */}
      <footer className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-8">
        © {new Date().getFullYear()} Universidad - Oficina de Exalumnos. Todos los derechos reservados.
      </footer>
    </div>
  )
}
