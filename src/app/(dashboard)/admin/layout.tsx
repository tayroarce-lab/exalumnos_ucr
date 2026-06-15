// Server Component — verificación de rol 'admin' como segunda capa de defensa
import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/admin/layout/Sidebar'
import { AdminFooter } from '@/components/admin/layout/AdminFooter'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar sesión activa
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar rol de administrador usando service_role para bypasear RLS
  const adminClient = createAdminClient()
  const { data: userData } = await adminClient
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .single()

  const esAdmin = userData?.rol === 'admin'

  if (!esAdmin) {
    // Silencioso: no revelar que la ruta existe
    redirect('/dashboard')
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main-content">
        {children}
        <AdminFooter />
      </div>
    </div>
  )
}
