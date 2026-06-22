// Server Component — verificación de rol 'admin' como segunda capa de defensa
import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminFooter } from '@/components/admin/layout/AdminFooter'
import { AdminThemeProvider } from '@/contexts/AdminThemeContext'
import { AdminLayoutClient } from '@/components/admin/layout/AdminLayoutClient'
import '../../../styles/admin-dashboard.css'

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
    return null
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
    <AdminThemeProvider>
      <AdminLayoutClient>
        {children}
        <AdminFooter />
      </AdminLayoutClient>
    </AdminThemeProvider>
  )
}

