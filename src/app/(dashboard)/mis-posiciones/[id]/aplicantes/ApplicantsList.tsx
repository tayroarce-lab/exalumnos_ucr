'use client'

import { useState } from 'react'
import { AlumniApplicationView, ApplicationStatus } from '@/types/applications'
import ApplicantCard from '@/components/applications/ApplicantCard'
import { updateApplicationStatus } from '@/actions/applications'

interface ApplicantsListProps {
  initialApplications: AlumniApplicationView[]
}

export default function ApplicantsList({ initialApplications }: ApplicantsListProps) {
  const [applications, setApplications] = useState<AlumniApplicationView[]>(initialApplications)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusUpdate = async (id: string, status: ApplicationStatus, closePosition?: boolean) => {
    setUpdatingId(id)
    try {
      const result = await updateApplicationStatus({
        application_id: id,
        status: status as 'en_revision' | 'seleccionado' | 'descartado',
        close_position: closePosition ?? false
      })

      if (result.success) {
        if (closePosition && status === 'seleccionado') {
          // Update all other non-discarded to discarded
          setApplications(prev => prev.map(app => {
            if (app.id === id) return { ...app, status }
            if (app.status !== 'descartado') return { ...app, status: 'descartado' }
            return app
          }))
        } else {
          setApplications(prev => prev.map(app => 
            app.id === id ? { ...app, status } : app
          ))
        }
      } else {
        alert(result.error || 'Error al actualizar el estado')
      }
    } catch (err) {
      console.error(err)
      alert('Error inesperado al actualizar')
    } finally {
      setUpdatingId(null)
    }
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay aplicantes aún</h3>
        <p className="text-gray-500">Cuando los estudiantes apliquen a tu posición, aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map(app => (
        <ApplicantCard 
          key={app.id} 
          application={app} 
          onStatusUpdate={handleStatusUpdate}
          isUpdating={updatingId === app.id}
        />
      ))}
    </div>
  )
}
