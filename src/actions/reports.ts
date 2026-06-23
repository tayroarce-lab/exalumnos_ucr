'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from './notifications'

// ─── Reportar un perfil (cualquier usuario autenticado) ───────────────────────
export async function reportarPerfil(reportedId: string, motivo: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  const { error: insertError } = await (adminClient as any)
    .from('reportes_perfiles')
    .insert({
      reporter_id: user.id,
      reported_id: reportedId,
      motivo,
      estado: 'pendiente'
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

// ─── Obtener todos los reportes pendientes (solo admin) ───────────────────────
export async function getPendingReports() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.rol !== 'admin') {
    return { success: false, error: 'No autorizado', data: [] }
  }

  const adminClient = createAdminClient()

  const { data, error } = await (adminClient as any)
    .from('reportes_perfiles')
    .select('id, reporter_id, reported_id, motivo, estado, created_at')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error obteniendo reportes pendientes:', error)
    return { success: false, error: error.message, data: [] }
  }

  // Enriquecer con info de usuarios (denunciante y reportado)
  const enriched = await Promise.all(
    (data || []).map(async (reporte: any) => {
      const [denuncianteRes, reportadoRes] = await Promise.all([
        adminClient.from('users').select('nombre, apellidos, email, reportes_recibidos').eq('id', reporte.reporter_id).single(),
        adminClient.from('users').select('nombre, apellidos, email, reportes_recibidos').eq('id', reporte.reported_id).single(),
      ])

      const buildNombre = (u: any) =>
        u ? `${u.nombre || ''} ${u.apellidos || ''}`.trim() || u.email : null

      return {
        ...reporte,
        perfil_reportado: reporte.reported_id,
        reportado_por: reporte.reporter_id,
        descripcion: '',
        resuelto: false,
        denunciante: denuncianteRes.data
          ? { nombre: buildNombre(denuncianteRes.data), email: denuncianteRes.data.email, reportes_recibidos: denuncianteRes.data.reportes_recibidos }
          : null,
        reportado: reportadoRes.data
          ? { nombre: buildNombre(reportadoRes.data), email: reportadoRes.data.email, reportes_recibidos: reportadoRes.data.reportes_recibidos }
          : null,
      }
    })
  )

  return { success: true, data: enriched }
}

// ─── Resolver (marcar como revisado) un reporte (solo admin) ──────────────────
export async function resolveReport(reporteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.rol !== 'admin') {
    throw new Error('No autorizado')
  }

  const adminClient = createAdminClient()

  const { error } = await (adminClient as any)
    .from('reportes_perfiles')
    .update({ estado: 'revisado' })
    .eq('id', reporteId)

  if (error) {
    console.error('Error resolviendo reporte:', error)
    throw new Error(error.message)
  }

  return { success: true }
}
