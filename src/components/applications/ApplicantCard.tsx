'use client'

import { useState } from 'react'
import { FileText, MapPin, GraduationCap, Check, X } from 'lucide-react'
import { AlumniApplicationView, ApplicationStatus } from '@/types/applications'
import ApplicationStatusBadge from './ApplicationStatusBadge'
import { getAvatarUrl } from '@/lib/utils'

interface ApplicantCardProps {
  application: AlumniApplicationView
  onStatusUpdate: (id: string, status: ApplicationStatus, closePosition?: boolean) => void
  isUpdating: boolean
}

export default function ApplicantCard({ application, onStatusUpdate, isUpdating }: ApplicantCardProps) {
  const { student, cv, compatibility_score, status, message } = application
  const [showConfirm, setShowConfirm] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleSelect = () => {
    setShowConfirm(true)
  }

  const confirmSelection = (closePosition: boolean) => {
    setShowConfirm(false)
    onStatusUpdate(application.id, 'seleccionado', closePosition)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border">
              {student.foto_url && !imgError ? (
                <img 
                  src={getAvatarUrl(student.foto_url, student.nombre) as string} 
                  alt={student.nombre} 
                  className="w-full h-full object-cover" 
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                  {student.nombre.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">{student.nombre}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <GraduationCap size={14} /> {student.carrera}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {student.sede}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <ApplicationStatusBadge status={status} />
            {compatibility_score !== null && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-500 mb-1">COMPATIBILIDAD</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${compatibility_score >= 80 ? 'bg-green-500' : compatibility_score >= 50 ? 'bg-yellow-400' : 'bg-gray-400'}`}
                    style={{ width: `${compatibility_score}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 mt-0.5">{compatibility_score}%</span>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic border border-gray-100">
            "{message}"
          </div>
        )}

        {showConfirm && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">¿Confirmar selección?</h4>
            <p className="text-sm text-blue-800 mb-3">Al seleccionar este candidato, se le enviará un correo electrónico de notificación.</p>
            <div className="space-y-2">
              <button 
                onClick={() => confirmSelection(true)}
                disabled={isUpdating}
                className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
              >
                Seleccionar y CERRAR vacante (descarta a los demás)
              </button>
              <button 
                onClick={() => confirmSelection(false)}
                disabled={isUpdating}
                className="w-full py-2 bg-white text-blue-700 border border-blue-200 text-sm font-medium rounded hover:bg-blue-50 transition"
              >
                Seleccionar y MANTENER vacante abierta
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isUpdating}
                className="w-full py-1 text-gray-500 text-sm font-medium hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          {cv ? (
            <button 
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
              onClick={() => alert('La visualización de CV requerirá integrar un visor de versiones de CV en una ruta específica.')}
            >
              <FileText size={16} />
              Ver CV ({cv.nombre_version})
            </button>
          ) : (
            <span className="text-sm text-gray-400 italic">Sin CV adjunto</span>
          )}
        </div>

        {!showConfirm && (
          <div className="flex items-center gap-2">
            {(status === 'enviada' || status === 'en_revision') && (
              <>
                <button
                  onClick={() => onStatusUpdate(application.id, 'descartado')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition disabled:opacity-50"
                >
                  <X size={16} /> Descartar
                </button>
                <button
                  onClick={handleSelect}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition disabled:opacity-50"
                >
                  <Check size={16} /> Seleccionar
                </button>
              </>
            )}
            
            {status === 'enviada' && (
              <button
                onClick={() => onStatusUpdate(application.id, 'en_revision')}
                disabled={isUpdating}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition disabled:opacity-50"
              >
                Marcar en revisión
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
