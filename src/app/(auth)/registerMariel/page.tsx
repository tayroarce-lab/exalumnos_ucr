'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { User, Mail, Calendar, Lock, Globe, Plus, Award } from 'lucide-react'
import Button from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    graduationYear: '2026',
    password: '',
    agreeTerms: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Guardar token y redirigir al dashboard
    localStorage.setItem('authToken', 'mock-token')
    window.location.href = '/dashboard'
  }

  // Generar años para graduación (de 1970 a 2026)
  const years = Array.from({ length: 57 }, (_, i) => {
    const year = (2026 - i).toString()
    return { value: year, label: year }
  })

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between py-12 px-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute left-10 bottom-10 w-72 h-72 bg-brand-celeste/5 rounded-full blur-2xl -z-10"></div>

      {/* Header Minimalista */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center pb-6 border-b border-slate-200/50 mb-10">
        <span className="font-display font-black text-xl text-slate-800 uppercase tracking-wider">
          Academic Connection
        </span>
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          ¿Ya tienes cuenta?{' '}
          <Link href="/loginMariel">
            <span className="font-bold text-brand-blue hover:text-brand-celeste transition-colors ml-1 cursor-pointer">
              Login
            </span>
          </Link>
        </div>
      </header>

      {/* Contenedor Principal (Dos Columnas) */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        
        {/* Columna Izquierda: Información / Imagen */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black text-brand-blue font-display uppercase tracking-wide leading-[1.1]">
              Únete a tu Red de Exalumnos
            </h1>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Conecta con miles de graduados, accede a oportunidades laborales exclusivas y mantén vivo el espíritu de nuestra comunidad académica.
            </p>
          </div>

          {/* Tarjeta de Comunidad */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-celeste/10 text-brand-celeste flex items-center justify-center shrink-0 shadow-sm">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Comunidad Global
              </h4>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5 leading-normal">
                Más de 50,000 exalumnos en 120 países compartiendo conocimientos.
              </p>
            </div>
          </div>

          {/* Banner con imagen decorativa */}
          <div className="bg-brand-blue rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
            <div className="absolute right-0 bottom-0 top-0 w-32 bg-white/5 rounded-l-full -z-10"></div>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full mb-3 tracking-wider">
              <Award className="w-3 h-3" /> Academic Connection Plus
            </span>
            <p className="font-display font-medium italic text-base leading-relaxed">
              "Tu red profesional comienza aquí, donde la excelencia se encuentra con la oportunidad."
            </p>
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="lg:col-span-7 w-full max-w-[620px] mx-auto bg-white p-8 sm:p-10 rounded-[28px] border border-slate-200/60 shadow-xl shadow-slate-100/50 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 font-display uppercase tracking-wide">
              Crea tu Perfil
            </h2>
            <p className="text-sm text-slate-500 font-semibold">
              Completa tus datos para iniciar tu registro oficial.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Nombre
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="Ej. Javier"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Apellidos
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Ej. Garcia López"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Correo Institucional o Personal
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="javier.garcia@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 transition-all font-medium"
                />
              </div>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Utiliza el correo con el que te graduaste si es posible.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Año de Graduación
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <Select
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    options={years}
                    className="h-11 pl-10 bg-slate-50 border-slate-200 focus:border-brand-blue rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Aceptación de términos */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="agree"
                name="agreeTerms"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
              />
              <label htmlFor="agree" className="text-xs text-slate-500 font-semibold leading-tight cursor-pointer select-none">
                Acepto los{' '}
                <span className="text-brand-blue font-bold hover:underline">Términos de Servicio</span> y la{' '}
                <span className="text-brand-blue font-bold hover:underline">Política de Privacidad</span> de Academic Connection.
              </label>
            </div>

            {/* Botón de acción principal */}
            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 font-bold uppercase tracking-wider text-sm rounded-xl mt-3 flex items-center justify-center gap-2 shadow-md shadow-brand-blue/10"
            >
              <span>Unirse a la Red</span>
              <span>→</span>
            </Button>
          </form>

          {/* Separador */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              o continúa con
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Botones Sociales */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => alert('Autenticación con Google (Demostración)')}
              className="flex items-center justify-center gap-2.5 h-11 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Google
              </span>
            </button>
            <button
              onClick={() => alert('Autenticación con LinkedIn (Demostración)')}
              className="flex items-center justify-center gap-2.5 h-11 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                LinkedIn
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer corporativo de registro */}
      <footer className="max-w-7xl w-full mx-auto border-t border-slate-200/50 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <span>© {new Date().getFullYear()} Academic Connection. All rights reserved.</span>
        <div className="flex gap-4">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact Us</span>
          <span>Alumni FAQ</span>
        </div>
      </footer>
    </div>
  )
}
