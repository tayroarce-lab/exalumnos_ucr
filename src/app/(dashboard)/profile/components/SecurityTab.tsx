'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/card'
import { Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { actualizarContrasena } from '@/actions/auth'

export default function SecurityTab() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (password.length !== 8) {
      setMessage({ text: 'La contraseña debe tener exactamente 8 caracteres.', type: 'error' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const result = await actualizarContrasena(password)
      if (result.success) {
        setMessage({ text: 'Tu contraseña se ha establecido correctamente.', type: 'success' })
        setPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ text: result.error || 'Ocurrió un error al guardar la contraseña.', type: 'error' })
      }
    } catch (error: any) {
      setMessage({ text: 'Error de conexión. Inténtalo más tarde.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Seguridad y Acceso</h2>
              <p className="text-slate-500 mt-1">
                Si ingresaste mediante un Magic Link, puedes establecer una contraseña aquí para iniciar sesión en el futuro de forma tradicional.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            {message && (
              <div className={`flex items-center gap-2 p-4 rounded-xl text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'error' ? <AlertCircle size={18} /> : <ShieldCheck size={18} />}
                <p>{message.text}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nueva Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Exactamente 8 caracteres"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-celeste focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-celeste focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-celeste text-white font-bold rounded-xl hover:bg-celeste/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Guardar Contraseña'
                )}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
