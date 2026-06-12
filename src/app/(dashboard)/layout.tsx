// Server Component — NO añadir 'use client'
// El middleware ya garantiza que el usuario está autenticado al llegar aquí,
// pero hacemos una segunda verificación para obtener el user y pasarlo al contexto.
import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/navbar'
import RealtimeApplicationStatus from '@/components/RealtimeApplicationStatus'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Segunda capa de protección: verifica sesión en el servidor
  // Esto cubre el caso en que el middleware sea bypasseado (RSC directs, etc.)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Navbar Superior */}
      <Navbar />

      <div className="flex flex-1 relative">
        {/* Contenido Principal */}
        <main className="flex-1 w-full min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* WebSocket: Notificaciones de cambio de estado de aplicaciones en tiempo real.
          Montado UNA SOLA VEZ en el layout para mantener la suscripción activa
          sin importar a qué página navegue el estudiante. */}
      <RealtimeApplicationStatus />
    </div>
  )
}
