import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { insertSupportQuery, fetchSupportQueries, updateSupportQuery } from '@/lib/supabase/support'
import { notifyAllAdmins } from '@/lib/notify-admins'

// GET /api/support-queries
// Admin → todas las consultas. Cualquier usuario → solo las suyas (por email).
export async function GET() {
  try {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    const adminClient = createAdminClient() as any
    const { data: profile } = await adminClient
      .from('users')
      .select('rol, email')
      .eq('id', user.id)
      .single()

    let data
    if (profile?.rol === 'admin') {
      data = await fetchSupportQueries(adminClient)
    } else {
      // Usar ambos emails (auth + public profile) por si difieren en datos de prueba
      const emails = [...new Set([user.email, profile?.email].filter(Boolean))] as string[]

      const { data: userQueries, error } = await adminClient
        .from('support_queries')
        .select('*')
        .in('email', emails)
        .order('created_at', { ascending: false })

      if (error) throw error
      data = userQueries
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error al obtener consultas de soporte:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

// POST /api/support-queries — cualquier usuario autenticado
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, subject, query_type, message } = body

    if (!full_name || !email || !subject || !query_type || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient() as any
    const data = await insertSupportQuery(supabase, {
      full_name,
      email,
      subject,
      query_type,
      message
    })

    // Notificar a todos los admins — en try/catch propio para que un fallo
    // de notificación nunca cause un error 500 al usuario que envía la consulta.
    try {
      await notifyAllAdmins({
        titulo: 'Nueva consulta de soporte',
        mensaje: `${full_name} envió una consulta: "${subject}" (${query_type})`,
        tipo: 'soporte_admin',
        link: '/admin/consultas-soporte'
      })
    } catch (notifErr) {
      console.error('Error al notificar admins (POST consulta):', notifErr)
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error al insertar consulta de soporte:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

// PATCH /api/support-queries — solo admin
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status, response } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'El id y el status son obligatorios.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient() as any
    const data = await updateSupportQuery(supabase, id, {
      status,
      response: response?.trim() || null
    })

    // Notificar al usuario que envió la consulta
    if (data && (status === 'Respondida' || status === 'En proceso')) {
      try {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('email', data.email)
          .maybeSingle()

        if (userRecord?.id) {
          // Evitar duplicados: no insertar si ya existe una notificación no leída
          // del mismo tipo para este asunto (el usuario aún no la vio)
          const { data: existing } = await supabase
            .from('notificaciones')
            .select('id')
            .eq('user_id', userRecord.id)
            .eq('tipo', 'soporte')
            .eq('leida', false)
            .ilike('mensaje', `%${data.subject}%`)
            .maybeSingle()

          if (!existing) {
            const titulo = status === 'Respondida'
              ? 'Tu consulta ha sido respondida'
              : 'Tu consulta está en proceso'

            // Solo incluir la respuesta en el mensaje si existe texto
            const mensaje = status === 'Respondida' && response?.trim()
              ? `Tu consulta "${data.subject}" ha sido respondida: "${response.trim()}"`
              : status === 'Respondida'
              ? `Tu consulta "${data.subject}" ha sido respondida por el equipo de soporte.`
              : `Tu consulta "${data.subject}" está siendo revisada por el equipo de soporte.`

            await supabase.from('notificaciones').insert({
              user_id: userRecord.id,
              titulo,
              mensaje,
              tipo: 'soporte',
              link: '/consultas-soporte',
              leida: false
            })
          }
        }
      } catch (notifError) {
        // No bloquear la respuesta si falla la notificación
        console.error('Error al crear notificación de soporte:', notifError)
      }
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar consulta de soporte:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
