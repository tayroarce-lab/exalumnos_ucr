import { createClient } from '@supabase/supabase-js'

export interface AdminNotifPayload {
  titulo: string
  mensaje: string
  tipo: string
  link?: string | null
}

/**
 * Inserta una notificación para cada usuario con rol='admin'.
 * Usa la service-role key para no ser bloqueado por RLS.
 * Solo debe invocarse desde contextos de servidor (API routes, Server Actions).
 */
export async function notifyAllAdmins(payload: AdminNotifPayload): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('[notifyAllAdmins] Faltan variables de entorno de Supabase.')
    return
  }

  // Cliente sin tipos para no depender de Database generado — solo server-side
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { data: admins, error: adminsErr } = await supabase
      .from('users')
      .select('id')
      .eq('rol', 'admin')

    if (adminsErr) {
      console.error('[notifyAllAdmins] Error al obtener admins:', adminsErr)
      return
    }

    if (!admins || admins.length === 0) return

    const rows = admins.map((admin: { id: string }) => ({
      user_id: admin.id,
      titulo: payload.titulo,
      mensaje: payload.mensaje,
      tipo: payload.tipo,
      link: payload.link ?? null,
      leida: false,
    }))

    const { error } = await supabase.from('notificaciones').insert(rows)
    if (error) {
      console.error('[notifyAllAdmins] Error al insertar notificaciones:', error)
    }
  } catch (err) {
    console.error('[notifyAllAdmins] Error inesperado:', err)
  }
}
