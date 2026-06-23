'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from './notifications'

export type SubmitReportInput = {
  perfil_reportado: string;
  motivo: 'Spam' | 'Perfil Falso' | 'Comportamiento Inapropiado' | 'Otro';
  descripcion?: string;
};

export async function submitProfileReport(input: SubmitReportInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  // Guardar el reporte en la tabla reportes_perfil
  const { error: insertError } = await adminClient
    .from('reportes_perfil' as any)
    .insert({
      reporter_id: user.id,
      reported_id: input.perfil_reportado,
      motivo: input.motivo,
      descripcion: input.descripcion || null
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
        link: '/admin/denuncias'
      })
    }
  }

  return { success: true }
}

export async function reportarPerfil(reportedId: string, motivo: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  // Guardar el reporte en la tabla reportes_perfil
  const { error: insertError } = await adminClient
    .from('reportes_perfil' as any)
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

export async function getPendingReports() {
  const adminClient = createAdminClient()
  
  const { data, error } = await adminClient
    .from('reportes_perfil' as any)
    .select(`
      id,
      reporter_id,
      reported_id,
      motivo,
      descripcion,
      resuelto,
      created_at,
      denunciante:users!reporter_id(nombre, email),
      reportado:users!reported_id(nombre, email, reportes_recibidos)
    `)
    .eq('resuelto', false)
    .order('created_at', { ascending: false })

  // Transform data slightly to match what UI expects:
  const formattedData = data?.map((r: any) => ({
    id: r.id,
    reportado_por: r.reporter_id,
    perfil_reportado: r.reported_id,
    motivo: r.motivo,
    descripcion: r.descripcion,
    resuelto: r.resuelto,
    created_at: r.created_at,
    denunciante: r.denunciante,
    reportado: r.reportado
  })) || []

  if (error) {
    console.error('Error fetching pending reports:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: formattedData }
}

export async function resolveReport(id: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('reportes_perfil' as any)
    .update({ resuelto: true })
    .eq('id', id)

  if (error) {
    console.error('Error resolving report:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
