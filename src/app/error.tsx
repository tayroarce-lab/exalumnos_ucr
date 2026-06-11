'use client' // Error components must be Client Components

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Aquí puedes registrar el error en un servicio externo como Sentry
    console.error('Aplicación ha capturado un error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#002855] to-slate-900 p-4 font-sans">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl"></div>

        {/* Ícono de Error */}
        <div className="relative w-20 h-20 mx-auto bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Código / Título */}
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300 mb-2">
          500 / Error
        </h1>
        
        <h2 className="text-xl font-bold text-white mb-4">
          ¡Ups! Algo salió mal
        </h2>

        <p className="text-slate-300 mb-6 text-sm leading-relaxed">
          Ha ocurrido un error inesperado en nuestros servidores o al cargar la información. El equipo técnico ha sido notificado.
        </p>

        {/* Muestra un digest técnico opcional si existe, útil para depurar sin revelar secretos */}
        {error.digest && (
          <div className="bg-black/30 p-2 rounded text-xs text-slate-500 font-mono mb-6 text-left break-all">
            Código interno: {error.digest}
          </div>
        )}

        <div className="flex flex-col gap-3 relative z-10">
          <button 
            onClick={() => reset()}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-rose-500/25"
          >
            Intentar nuevamente
          </button>
          
          <Link 
            href="/dashboard"
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Volver al inicio seguro
          </Link>
        </div>

      </div>
    </div>
  )
}
