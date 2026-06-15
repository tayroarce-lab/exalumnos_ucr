import { Resend } from 'resend'

// Instancia global de Resend
const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL || 'Plataforma Alumni UCR <noreply@fundacionexalumnosucr.org>'

// Creamos la instancia solo si hay API Key, de lo contrario loggeamos en consola (útil para dev local sin variables configuradas)
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendApplicationReceivedEmail(params: {
  alumniEmail: string
  alumniName: string
  studentName: string
  positionTitle: string
  applicationUrl: string
}): Promise<void> {
  const subject = `Nueva aplicación recibida: ${params.positionTitle}`
  const html = `
    <h2>Hola ${params.alumniName},</h2>
    <p>Tienes una nueva aplicación de <strong>${params.studentName}</strong> para tu posición <strong>'${params.positionTitle}'</strong>.</p>
    <p>Puedes revisar los aplicantes y sus currículums en el siguiente enlace:</p>
    <p><a href="${params.applicationUrl}" style="background-color:#0033A0; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Ver Aplicantes</a></p>
    <br/>
    <p>Saludos,<br/>Equipo de Fundación Exalumnos UCR</p>
  `

  if (!resend) {
    console.log('[Email Mock] sendApplicationReceivedEmail:', subject, params.alumniEmail)
    return
  }

  await resend.emails.send({
    from: fromEmail,
    to: params.alumniEmail,
    subject,
    html
  })
}

export async function sendApplicationSelectedEmail(params: {
  studentEmail: string
  studentName: string
  positionTitle: string
  alumniName: string
}): Promise<void> {
  const subject = `¡Felicidades! Fuiste seleccionado para la posición: ${params.positionTitle}`
  const html = `
    <h2>¡Felicidades ${params.studentName}!</h2>
    <p>Tenemos excelentes noticias: has sido seleccionado para la posición <strong>'${params.positionTitle}'</strong>.</p>
    <p>El exalumno <strong>${params.alumniName}</strong> se pondrá en contacto contigo pronto utilizando el correo electrónico o teléfono que proporcionaste en tu currículum o perfil.</p>
    <p>¡Mucho éxito en esta nueva oportunidad!</p>
    <br/>
    <p>Saludos,<br/>Equipo de Fundación Exalumnos UCR</p>
  `

  if (!resend) {
    console.log('[Email Mock] sendApplicationSelectedEmail:', subject, params.studentEmail)
    return
  }

  await resend.emails.send({
    from: fromEmail,
    to: params.studentEmail,
    subject,
    html
  })
}

export async function sendApplicationDiscardedEmail(params: {
  studentEmail: string
  studentName: string
  positionTitle: string
}): Promise<void> {
  const subject = `Actualización de tu aplicación: ${params.positionTitle}`
  const html = `
    <h2>Hola ${params.studentName},</h2>
    <p>Gracias por tu interés en la posición <strong>'${params.positionTitle}'</strong>.</p>
    <p>Queremos informarte que, en esta ocasión, la posición ha sido cubierta por otro candidato o el proceso de selección ha finalizado.</p>
    <p>Te animamos a seguir explorando nuevas oportunidades en la plataforma. ¡Te deseamos mucho éxito en tu búsqueda!</p>
    <br/>
    <p>Saludos,<br/>Equipo de Fundación Exalumnos UCR</p>
  `

  if (!resend) {
    console.log('[Email Mock] sendApplicationDiscardedEmail:', subject, params.studentEmail)
    return
  }

  await resend.emails.send({
    from: fromEmail,
    to: params.studentEmail,
    subject,
    html
  })
}
