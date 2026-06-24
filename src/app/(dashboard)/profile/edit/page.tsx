'use client'

import React, { useEffect, useState } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import StudentOnboardingForm from '@/components/forms/StudentOnboardingForm'
import ExalumnoOnboardingForm from '@/components/forms/ExalumnoOnboardingForm'
import { ArrowLeft, UserCircle2 } from 'lucide-react'
import Link from 'next/link'
import { obtenerMiPerfil } from '@/actions/users'

export default function ProfileEditPage() {
  const { user, profile, isLoading: isContextLoading } = useProfile()
  const [fullProfile, setFullProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadFullProfile() {
      if (user) {
        try {
          const data = await obtenerMiPerfil()
          setFullProfile(data)
        } catch (err) {
          console.error("Error loading full profile:", err)
        }
      }
      setIsLoading(false)
    }
    
    if (!isContextLoading) {
      loadFullProfile()
    }
  }, [user, isContextLoading])

  if (isContextLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-celeste"></div>
      </div>
    )
  }

  if (!user || !profile || !fullProfile) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">No se pudo cargar la información del usuario.</p>
      </div>
    )
  }

  const isStudent = user.user_metadata?.rol === 'estudiante'

  // El profile completo se usará como initialData
  const initialData = {
    ...profile,
    ...fullProfile, // Contiene estudiantes, exalumnos, curriculums combinados
    // Asegurar mapeo de los campos específicos de biografía y foto
    bio: fullProfile.bio || fullProfile.resumen || profile.bio || '',
    foto_url: fullProfile.foto_url || profile.foto_url || '',
    // Las habilidades se sacan del curriculum si existe
    habilidades: fullProfile.habilidades || []
  }

  const userName = profile?.full_name || fullProfile?.nombre || user.user_metadata?.nombre || 'No disponible'

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-celeste transition-colors uppercase tracking-wider mb-4">
            <ArrowLeft size={16} /> Volver a mi perfil
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-celeste/10 rounded-2xl text-celeste hidden sm:block">
              <UserCircle2 size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
                Editar Perfil
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Mantén tu información actualizada para conectar mejor con la comunidad
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-1 sm:p-2">
        {isStudent ? (
          <StudentOnboardingForm 
            isEditMode={true} 
            initialData={initialData} 
            userName={userName} 
            userEmail={user.email} 
          />
        ) : (
          <ExalumnoOnboardingForm 
            isEditMode={true} 
            initialData={initialData} 
            userName={userName} 
            userEmail={user.email} 
          />
        )}
      </div>
    </div>
  )
}
