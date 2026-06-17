import { Resend } from 'resend';

// Inicializa el cliente de Resend usando la API Key del entorno
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

// Dirección de remitente oficial de la Fundación (Cambiado a onboarding para que funcione sin verificar dominio)
const FROM_ADDRESS = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
  ? 'onboarding@resend.dev'
  : 'Fundación Exalumnos UCR <notificaciones@fundacion.ucr.ac.cr>';

// ---------------------------------------------------------------------------
// Helper: Genera el wrapper HTML con diseño base de la marca
// Genera la estructura HTML base con el diseño institucional de la Fundación
// ---------------------------------------------------------------------------
function buildEmailTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#F0F4F8; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0F4F8; padding: 32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#0A2540; padding:28px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:700; letter-spacing:0.5px;">
                🎓 Fundación Exalumnos UCR
              </h1>
              <p style="margin:6px 0 0; color:#94a3b8; font-size:13px;">Red de Apoyo Estudiantil</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc; padding:20px 40px; border-top:1px solid #E2E8F0; text-align:center;">
              <p style="margin:0; font-size:12px; color:#94a3b8;">
                © 2026 Fundación Exalumnos UCR · Universidad de Costa Rica<br/>
                <a href="https://exalumnos.ucr.ac.cr" style="color:#3b82f6; text-decoration:none;">exalumnos.ucr.ac.cr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// DONACIONES
// ---------------------------------------------------------------------------

/**
 * Envía correos de confirmación de donación al donante y al estudiante.
 * Sends donation confirmation emails to both donor and student.
 */
export async function sendDonationConfirmationEmails(
  donorEmail: string,
  donorName: string,
  amount: number,
  currency: string,
  studentEmail?: string | null,
  studentName?: string | null
) {
  const formattedAmount = currency === 'CRC'
    ? `₡ ${amount.toLocaleString('es-CR')}`
    : `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  try {
    // Email al donante (exalumno)
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: donorEmail,
      subject: '✅ Tu donación fue confirmada — Fundación Exalumnos UCR',
      html: buildEmailTemplate('Donación Confirmada', `
        <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">¡Gracias por tu generosidad, ${donorName}!</h2>
        <p style="color:#64748b; font-size:15px; margin:0 0 24px;">Tu donación ha sido verificada y confirmada exitosamente.</p>
        
        <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:12px; padding:20px; margin:0 0 24px;">
          <p style="margin:0 0 6px; font-size:13px; color:#059669; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Monto Confirmado</p>
          <p style="margin:0; font-size:28px; font-weight:700; color:#065f46;">${formattedAmount}</p>
        </div>
        
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 24px;">
          Tu apoyo hace una diferencia real en la vida de estudiantes universitarios como <strong>${studentName}</strong>. 
          Gracias por contribuir a la red de apoyo de la Universidad de Costa Rica.
        </p>
        
        <div style="text-align:center; margin-top:28px;">
          <a href="https://exalumnos.ucr.ac.cr/dashboard" 
             style="background:#0A2540; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block;">
            Ver mi historial de donaciones
          </a>
        </div>
      `)
    });

    // Email al estudiante (beneficiario) - Solo si existe
    if (studentEmail && studentName) {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: studentEmail,
        subject: '🎉 ¡Recibiste una donación confirmada! — Fundación Exalumnos UCR',
        html: buildEmailTemplate('Donación Recibida', `
          <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">¡Buenas noticias, ${studentName}!</h2>
          <p style="color:#64748b; font-size:15px; margin:0 0 24px;">Una donación para tu proyecto ha sido confirmada por la Fundación.</p>
          
          <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:12px; padding:20px; margin:0 0 24px;">
            <p style="margin:0 0 6px; font-size:13px; color:#059669; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Monto Recibido</p>
            <p style="margin:0; font-size:28px; font-weight:700; color:#065f46;">${formattedAmount}</p>
          </div>
          
          <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 24px;">
            Un exalumno de la UCR ha decidido apoyar tu trayectoria académica. 
            Sigue adelante con tu excelente trabajo — la comunidad universitaria está contigo.
          </p>
          
          <div style="text-align:center; margin-top:28px;">
            <a href="https://exalumnos.ucr.ac.cr/dashboard" 
               style="background:#059669; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block;">
              Ver mi perfil
            </a>
          </div>
        `)
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending donation confirmation emails:', error);
    return { success: false, error };
  }
}

/**
 * Envía un correo de rechazo al donante con el motivo obligatorio.
 * Sends a rejection email to the donor with the mandatory reason.
 */
export async function sendDonationRejectionEmail(
  donorEmail: string,
  donorName: string,
  rejectionReason: string
) {
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: donorEmail,
      subject: '⚠️ Problema con tu reporte de donación — Fundación Exalumnos UCR',
      html: buildEmailTemplate('Revisión Requerida', `
        <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">Hola, ${donorName}</h2>
        <p style="color:#64748b; font-size:15px; margin:0 0 24px;">
          Hemos revisado el comprobante de tu donación, pero no pudimos confirmarlo en esta ocasión.
        </p>
        
        <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:12px; padding:20px; margin:0 0 24px;">
          <p style="margin:0 0 8px; font-size:13px; color:#dc2626; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Motivo del rechazo</p>
          <p style="margin:0; font-size:14px; color:#991b1b; line-height:1.6;">${rejectionReason}</p>
        </div>
        
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 24px;">
          Por favor, revisa la información proporcionada y vuelve a intentarlo. 
          Si crees que esto es un error, comunícate con nuestro equipo.
        </p>
        
        <div style="text-align:center; margin-top:28px;">
          <a href="https://exalumnos.ucr.ac.cr/donaciones/nueva" 
             style="background:#dc2626; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block;">
            Intentar de nuevo
          </a>
        </div>
      `)
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// MATCHES
// ---------------------------------------------------------------------------

/**
 * Notifica a exalumno y estudiante cuando se crea o activa un nuevo match.
 * Notifies alumni and student when a new match is created or activated.
 */
export async function sendMatchNotificationEmails(
  alumniEmail: string,
  alumniName: string,
  studentEmail: string,
  studentName: string,
  supportType: string,
  matchScore: number
) {
  try {
    // Email al exalumno
    const resultAlumni = await resend.emails.send({
      from: FROM_ADDRESS,
      to: (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) ? 'tarcebfwd@gmail.com' : alumniEmail,
      subject: '🤝 Nuevo match sugerido para ti — Fundación Exalumnos UCR',
      html: buildEmailTemplate('Nuevo Match', `
        <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">¡Tienes un nuevo match, ${alumniName}!</h2>
        <p style="color:#64748b; font-size:15px; margin:0 0 24px;">
          El sistema ha encontrado un estudiante con quien puedes conectar y apoyar.
        </p>
        
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:20px; margin:0 0 24px;">
          <p style="margin:0 0 4px; font-size:13px; color:#3b82f6; font-weight:600; text-transform:uppercase;">Compatibilidad</p>
          <p style="margin:0 0 12px; font-size:32px; font-weight:700; color:#1d4ed8;">${matchScore}%</p>
          <p style="margin:0 0 4px; font-size:13px; color:#475569;"><strong>Estudiante:</strong> ${studentName}</p>
          <p style="margin:0; font-size:13px; color:#475569;"><strong>Tipo de apoyo:</strong> ${supportType}</p>
        </div>
        
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 24px;">
          Revisa el perfil del estudiante y decide si deseas aceptar esta conexión.
          Tu experiencia puede marcar una diferencia en su trayectoria académica y profesional.
        </p>
        
        <div style="text-align:center; margin-top:28px;">
          <a href="https://exalumnos.ucr.ac.cr/matches" 
             style="background:#0A2540; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block;">
            Ver mi match
          </a>
        </div>
      `)
    });

    if (resultAlumni.error) console.error('Resend Error Exalumno:', resultAlumni.error);

    // Email al estudiante
    const resultEst = await resend.emails.send({
      from: FROM_ADDRESS,
      to: (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) ? 'tarcebfwd@gmail.com' : studentEmail,
      subject: '✨ ¡Un exalumno quiere apoyarte! — Fundación Exalumnos UCR',
      html: buildEmailTemplate('Nuevo Match', `
        <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">¡Buenas noticias, ${studentName}!</h2>
        <p style="color:#64748b; font-size:15px; margin:0 0 24px;">
          La Fundación ha encontrado un exalumno que puede apoyarte en tu trayectoria.
        </p>
        
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:20px; margin:0 0 24px;">
          <p style="margin:0 0 4px; font-size:13px; color:#3b82f6; font-weight:600; text-transform:uppercase;">Compatibilidad</p>
          <p style="margin:0 0 12px; font-size:32px; font-weight:700; color:#1d4ed8;">${matchScore}%</p>
          <p style="margin:0 0 4px; font-size:13px; color:#475569;"><strong>Exalumno:</strong> ${alumniName}</p>
          <p style="margin:0; font-size:13px; color:#475569;"><strong>Tipo de apoyo:</strong> ${supportType}</p>
        </div>
        
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 24px;">
          Pronto el exalumno puede ponerse en contacto contigo. Mantente pendiente de las notificaciones 
          en tu perfil de la plataforma.
        </p>
        
        <div style="text-align:center; margin-top:28px;">
          <a href="https://exalumnos.ucr.ac.cr/dashboard" 
             style="background:#059669; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block;">
            Ver mi perfil
          </a>
        </div>
      `)
    });

    if (resultEst.error) console.error('Resend Error Estudiante:', resultEst.error);

    return { success: true };
  } catch (error) {
    console.error('Error sending match notification emails:', error);
    return { success: false, error };
  }
}

/**
 * Notifica cuando un match cambia a estado "activo" o "cerrado".
 * Notifies when a match changes to "active" or "closed" status.
 */
export async function sendMatchStatusUpdateEmail(
  recipientEmail: string,
  recipientName: string,
  newStatus: 'activo' | 'cerrado',
  resultado?: 'exitoso' | 'cancelado' | 'en_progreso' | null,
  counterpartName?: string | null,
  counterpartEmail?: string | null
) {
  const isActive = newStatus === 'activo';
  const isSuccess = resultado === 'exitoso';

  const subject = isActive
    ? `🟢 Tu match está ahora activo, ${recipientName} — Fundación Exalumnos UCR`
    : isSuccess
    ? `🏆 Match completado exitosamente, ${recipientName} — Fundación Exalumnos UCR`
    : `📋 Actualización de tu match, ${recipientName} — Fundación Exalumnos UCR`;

  const body = isActive
    ? `
      <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">¡Tu match está activo, ${recipientName}!</h2>
      <p style="color:#64748b; font-size:15px; margin:0 0 24px;">La conexión ha sido confirmada y está en marcha.</p>
      <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:12px; padding:16px; margin:0 0 24px;">
        <p style="margin:0; font-size:14px; color:#065f46; font-weight:600;">Estado: Activo ✅</p>
      </div>
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:20px; margin:0 0 24px;">
        <p style="margin:0 0 4px; font-size:13px; color:#3b82f6; font-weight:600; text-transform:uppercase;">Datos de Contacto</p>
        <p style="margin:0 0 4px; font-size:14px; color:#1e293b;"><strong>Contraparte:</strong> ${counterpartName || 'Usuario'}</p>
        <p style="margin:0; font-size:14px; color:#1e293b;"><strong>Email:</strong> <a href="mailto:${counterpartEmail}" style="color:#2563eb; text-decoration:none;">${counterpartEmail}</a></p>
      </div>
      <p style="color:#475569; font-size:14px; line-height:1.6;">Recuerda mantener una comunicación fluida y respetuosa con tu contraparte. Ya pueden coordinar directamente vía correo electrónico.</p>
    `
    : `
      <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">Actualización de tu match</h2>
      <p style="color:#64748b; font-size:15px; margin:0 0 24px;">Tu match ha sido cerrado por la Fundación.</p>
      <div style="background:${isSuccess ? '#ecfdf5' : '#fef2f2'}; border:1px solid ${isSuccess ? '#a7f3d0' : '#fca5a5'}; border-radius:12px; padding:16px; margin:0 0 24px;">
        <p style="margin:0; font-size:14px; color:${isSuccess ? '#065f46' : '#991b1b'}; font-weight:600;">
          Resultado: ${isSuccess ? '¡Exitoso! 🏆' : 'Cancelado'}
        </p>
      </div>
      ${isSuccess ? '<p style="color:#475569; font-size:14px;">¡Felicidades por completar este proceso de apoyo!</p>' : '<p style="color:#475569; font-size:14px;">Si tienes dudas sobre el cierre, comunícate con nosotros.</p>'}
    `;

  try {
    const resultUpdate = await resend.emails.send({
      from: FROM_ADDRESS,
      to: (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) ? 'tarcebfwd@gmail.com' : recipientEmail,
      subject,
      html: buildEmailTemplate('Actualización de Match', body)
    });

    if (resultUpdate.error) console.error('Resend Error Update:', resultUpdate.error);

    return { success: true };
  } catch (error) {
    console.error('Error sending match status update email:', error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// ALERTAS ADMINISTRATIVAS
// ---------------------------------------------------------------------------

/**
 * Envía una alerta al equipo admin cuando hay donaciones con +24h sin revisar.
 * Sends an alert to the admin team when donations have been pending for +24h.
 */
export async function sendAdminDonationAlert(
  adminEmail: string,
  pendingCount: number
) {
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: adminEmail,
      subject: `⚠️ ${pendingCount} donación(es) llevan +24h sin revisar — Acción requerida`,
      html: buildEmailTemplate('Alerta Administrativa', `
        <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">Alerta: Donaciones pendientes</h2>
        <p style="color:#64748b; font-size:15px; margin:0 0 24px;">
          Hay donaciones que requieren tu atención urgente.
        </p>
        
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:20px; margin:0 0 24px;">
          <p style="margin:0 0 4px; font-size:13px; color:#d97706; font-weight:600; text-transform:uppercase;">Donaciones sin revisar +24h</p>
          <p style="margin:0; font-size:36px; font-weight:700; color:#92400e;">${pendingCount}</p>
        </div>
        
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 24px;">
          Estas donaciones llevan más de 24 horas en estado pendiente. 
          Por favor, accede al panel de administración para procesarlas.
        </p>
        
        <div style="text-align:center; margin-top:28px;">
          <a href="https://exalumnos.ucr.ac.cr/admin/donaciones" 
             style="background:#d97706; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block;">
            Revisar donaciones pendientes
          </a>
        </div>
      `)
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending admin donation alert:', error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// REPORTES DE PERFIL
// ---------------------------------------------------------------------------

/**
 * Notifica a un admin o usuario sobre un reporte.
 */
export async function sendReportNotificationEmail(
  email: string,
  tipo: 'nuevo' | 'resuelto',
  motivo: string
) {
  const subject = tipo === 'nuevo' 
    ? '⚠️ Nuevo reporte de perfil requiere revisión' 
    : '📢 Actualización sobre el estado de tu cuenta';

  const body = tipo === 'nuevo'
    ? `
      <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">Nuevo Reporte Recibido</h2>
      <p style="color:#64748b; font-size:15px; margin:0 0 24px;">Un usuario ha reportado un perfil en la plataforma.</p>
      <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:12px; padding:16px; margin:0 0 24px;">
        <p style="margin:0; font-size:14px; color:#991b1b; font-weight:600;">Motivo: ${motivo}</p>
      </div>
      <p style="color:#475569; font-size:14px;">Por favor, ingresa al panel de administración para revisarlo.</p>
    `
    : `
      <h2 style="margin:0 0 8px; color:#0A2540; font-size:22px;">Notificación de Administración</h2>
      <p style="color:#64748b; font-size:15px; margin:0 0 24px;">Se ha revisado un reporte relacionado con tu cuenta.</p>
      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:16px; margin:0 0 24px;">
        <p style="margin:0; font-size:14px; color:#d97706; font-weight:600;">Motivo del reporte original: ${motivo}</p>
      </div>
      <p style="color:#475569; font-size:14px;">Hemos tomado las medidas necesarias. Asegúrate de cumplir con los lineamientos de la comunidad.</p>
    `;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html: buildEmailTemplate('Notificación de Reporte', body)
    });
    return { success: true };
  } catch (error) {
    console.error('Error enviando notificación de reporte:', error);
    return { success: false, error };
  }
}

