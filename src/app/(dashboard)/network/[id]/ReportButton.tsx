'use client'

import { useState } from 'react'
import { Flag, X, AlertTriangle, Loader2 } from 'lucide-react'
import { reportarPerfil } from '@/actions/reports'

const PREDEFINED_REASONS = [
  'Perfil falso o identidad suplantada',
  'Información inapropiada u ofensiva',
  'Spam o comportamiento comercial no deseado',
  'Acoso o comportamiento abusivo',
  'Otro motivo'
]

export default function ReportButton({ targetUserId }: { targetUserId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState(PREDEFINED_REASONS[0])
  const [otherReason, setOtherReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let motivo = selectedReason
    if (selectedReason === 'Otro motivo') {
      if (!otherReason.trim()) {
        setError('Por favor, especifica el motivo del reporte.')
        return
      }
      motivo = otherReason.trim()
    }

    setIsSubmitting(true)
    setError('')
    
    try {
      const res = await reportarPerfil(targetUserId, motivo)
      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error || 'Ocurrió un error al enviar el reporte.')
      }
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo más tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <Flag className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-emerald-800">Reporte enviado</h3>
        <p className="text-xs text-emerald-600">El equipo de administración revisará este perfil de forma confidencial.</p>
      </div>
    )
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all px-4 py-2.5 rounded-xl shadow-sm"
        title="Reportar este perfil"
      >
        <Flag className="w-4 h-4" />
        Reportar Perfil
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Reportar Perfil
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                ¿Por qué deseas reportar este perfil? Tu reporte es confidencial y el usuario no será notificado.
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {PREDEFINED_REASONS.map((reason) => (
                  <label key={reason} className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        name="report_reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-4 h-4 text-[#F34B26] border-slate-300 focus:ring-[#F34B26]"
                      />
                    </div>
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{reason}</span>
                  </label>
                ))}
              </div>

              {selectedReason === 'Otro motivo' && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                  <textarea
                    placeholder="Describe brevemente el motivo de tu reporte..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F34B26]/20 focus:border-[#F34B26] transition-all resize-none h-24"
                    maxLength={500}
                  />
                  <p className="text-[10px] text-slate-400 text-right mt-1">
                    {otherReason.length}/500
                  </p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-red-500/20"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
