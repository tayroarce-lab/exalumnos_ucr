'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#002855] to-slate-900 p-4 font-sans">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
        
        {/* Ícono de Brújula o Lupa */}
        <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Código de Error */}
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Página no encontrada
        </h2>

        <p className="text-slate-300 mb-8 text-sm leading-relaxed">
          Lo sentimos, la ruta a la que intentas acceder no existe, ha sido movida o no tienes permisos para verla.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/dashboard"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30"
          >
            Ir al inicio
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Volver a la página anterior
          </button>
        </div>

      </div>
    </div>
  )
}
