'use client'

import { useState, useEffect, useTransition } from 'react'
import { X, CheckCircle, FileText, Send } from 'lucide-react'
import { applyToPosition } from '@/actions/applications'
import LoadingSpinner from '@/components/LoadingSpinner'

interface ApplyModalProps {
  position: { id: string; title: string; alumni_name: string }
  onClose: () => void
  onSuccess: () => void
}

export default function ApplyModal({ position, onClose, onSuccess }: ApplyModalProps) {
  const [message, setMessage] = useState('')
  const [cvId, setCvId] = useState<string>('')
  const [cvs, setCvs] = useState<any[]>([])
  const [loadingCvs, setLoadingCvs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function loadCvs() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data } = await supabase
            .from('cv_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()
            
          if (data) {
            setCvs([{ id: data.id, nombre_version: 'Mi CV Principal' }])
            setCvId(data.id) // Preseleccionar el CV principal
          }
        }
      } catch (err) {
        console.error('Error cargando CVs:', err)
      } finally {
        setLoadingCvs(false)
      }
    }
    loadCvs()
  }, [])

  const handleApply = () => {
    setError(null)
    startTransition(async () => {
      const result = await applyToPosition({
        position_id: position.id,
        cv_id: cvId ? cvId : undefined,
        message: message.trim() ? message.trim() : undefined
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError(result.error || 'Error al aplicar')
      }
    })
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">¡Aplicación Enviada!</h2>
          <p className="text-gray-600">Has aplicado exitosamente a {position.title}. El exalumno ha sido notificado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-8">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Aplicar a Posición</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium text-gray-900">{position.title}</h3>
            <p className="text-sm text-gray-500">Publicado por {position.alumni_name}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Selecciona tu CV</label>
            {loadingCvs ? (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                 Cargando tus CVs...
              </div>
            ) : (
              <select
                value={cvId}
                onChange={(e) => setCvId(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              >
                <option value="">Sin CV adjunto</option>
                {cvs.map(cv => (
                  <option key={cv.id} value={cv.id}>{cv.nombre_version}</option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500">Puedes adaptar y crear versiones de CV desde tu panel de empleabilidad.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Mensaje de presentación (opcional)</label>
              <span className="text-xs text-gray-400">{message.length} / 500</span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Escribe un breve mensaje explicando por qué eres el candidato ideal..."
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 border resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={isPending || message.length > 500}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <>Enviando...</>
            ) : (
              <>
                <Send size={16} />
                Enviar aplicación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
