'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from './notifications'

export async function reportarPerfil(reportedId: string, motivo: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  // Guardar el reporte en la tabla reportes_perfiles
  const { error: insertError } = await adminClient
    .from('reportes_perfiles' as any)
    .insert({
      reporter_id: user.id,
      reported_id: reportedId,
      motivo
    })

  if (insertError) {
    console.error('Error insertando reporte:', insertError)
    return { success: false, error: insertError.message }
  }

  // Notificar a los administradores
  const { data: admins } = await adminClient
    .from('users')
    .select('id')
    .eq('rol', 'admin')

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await createNotification({
        user_id: admin.id,
        titulo: 'Nuevo reporte de perfil',
        mensaje: 'Un usuario ha reportado un perfil. Por favor revisa el panel de administración.',
        tipo: 'sistema',
        link: '/admin' // O a donde corresponda
      })
    }
  }

  // Podríamos enviar correo aquí si tuviéramos un helper listo

  return { success: true }
}
