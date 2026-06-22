import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { logError } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY)

// Definición de la carga útil del Webhook de Supabase
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  old_record: any
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WebhookPayload

    // Verificamos que sea una actualización a la tabla posiciones
    if (payload.table !== 'posiciones' || payload.type !== 'UPDATE') {
      return NextResponse.json({ message: 'Evento ignorado' })
    }

    const { record, old_record } = payload

    // Si el estado no cambió a 'cubierta', ignoramos
    if (old_record?.estado === 'cubierta' || record?.estado !== 'cubierta') {
      return NextResponse.json({ message: 'El estado no cambió a cubierta, ignorado' })
    }

    const posicionId = record.id
    const tituloPosicion = record.titulo

    const supabaseAdmin = createAdminClient()

    // 1. Obtener todas las aplicaciones 'pendientes' para esta posición
    const { data: aplicaciones, error: aplicacionesError } = await supabaseAdmin
      .from('applications')
      .select('student_id')
      .eq('position_id', posicionId)
      .eq('status', 'enviada')

    if (aplicacionesError) throw aplicacionesError

    if (!aplicaciones || aplicaciones.length === 0) {
      return NextResponse.json({ message: 'No hay aplicaciones pendientes para notificar' })
    }

    const estudianteIds = aplicaciones.map(a => a.student_id)

    // 2. Obtener los emails de esos estudiantes
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('users')
      .select('email')
      .in('id', estudianteIds)
      .not('email', 'is', null)

    if (usuariosError) throw usuariosError

    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json({ message: 'No se encontraron emails de estudiantes' })
    }

    const correosBcc = usuarios.map(u => u.email)

    // 3. Enviar correo usando Resend en BCC (Copias Ocultas para privacidad)
    const { error: resendError } = await resend.emails.send({
      from: 'Directorio de Exalumnos UCR <no-reply@exalumnos.cr>', // Ajustar al dominio verificado en Resend
      to: ['notificaciones@exalumnos.cr'], // Destinatario dummy o admin
      bcc: correosBcc,
      subject: `Posición Cubierta: ${tituloPosicion}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0055a4;">Actualización sobre tu aplicación</h2>
          <p>Hola,</p>
          <p>Te informamos que la posición <strong>"${tituloPosicion}"</strong> a la que aplicaste recientemente ha sido marcada como <strong>Cubierta</strong> por el exalumno responsable.</p>
          <p>Por lo tanto, ya no se aceptarán más aplicaciones ni se avanzará con nuevas entrevistas para este rol específico.</p>
          <p>Te animamos a seguir revisando el directorio de oportunidades para más posiciones abiertas.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">
            Este es un correo automático de la Red de Exalumnos UCR. Por favor no respondas a este mensaje.
          </p>
        </div>
      `,
    })

    if (resendError) {
      logError('posiciones-cubiertas/route.ts/POST', resendError, { posicionId });
      return NextResponse.json({ error: 'Fallo al enviar correos' }, { status: 500 })
    }

    // 4. (Opcional) Marcar aplicaciones como 'rechazada' o 'cerrada'
    // Descomentar la siguiente línea si el negocio dicta que se deben cerrar las aplicaciones pendientes
    // await supabaseAdmin.from('applications').update({ status: 'descartado' }).eq('position_id', posicionId).eq('status', 'enviada')

    return NextResponse.json({ 
      success: true, 
      message: `Notificaciones enviadas a ${correosBcc.length} estudiantes`
    })

  } catch (error: any) {
    logError('posiciones-cubiertas/route.ts/POST', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
