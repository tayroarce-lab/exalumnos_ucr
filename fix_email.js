const fs = require('fs');
const file = 'src/services/email-service.ts';
let txt = fs.readFileSync(file, 'utf-8');
const idx = txt.indexOf('export async function sendTallerApprovalEmail');
if(idx !== -1) {
  txt = txt.slice(0, idx);
}
const goodCode = `export async function sendTallerApprovalEmail(toEmail: string, tallerTitulo: string, isApproved: boolean) {
  try {
    const estado = isApproved ? 'aprobado' : 'rechazado';
    const message = isApproved 
      ? '¡Felicidades! Tu taller ha sido aprobado y ya está disponible para que los estudiantes se postulen.'
      : 'Lo sentimos, tu taller ha sido rechazado por un administrador. Puedes ponerte en contacto con soporte para más detalles.';
    
    await resend.emails.send({
      from: 'Fundación Exalumnos UCR <onboarding@resend.dev>',
      to: [toEmail],
      subject: \`Actualización sobre tu taller: \${tallerTitulo}\`,
      html: \`
        <h2>Actualización sobre tu taller</h2>
        <p>Hola,</p>
        <p>El estado de tu taller <strong>\${tallerTitulo}</strong> ha cambiado a <strong>\${estado}</strong>.</p>
        <p>\${message}</p>
        <br />
        <p>Atentamente,</p>
        <p>El equipo de la Fundación Exalumnos UCR</p>
      \`,
    });
  } catch (error) {
    console.error('Error enviando email de taller (aprobacion):', error);
  }
}

export async function sendTallerApplicationResultEmail(toEmail: string, tallerTitulo: string, isAccepted: boolean) {
  try {
    const estado = isAccepted ? 'aceptada' : 'rechazada';
    const message = isAccepted
      ? '¡Felicidades! Has sido aceptado en el taller. Pronto recibirás más detalles sobre el mismo.'
      : 'Lo sentimos, tu postulación al taller no ha sido seleccionada en esta ocasión.';

    await resend.emails.send({
      from: 'Fundación Exalumnos UCR <onboarding@resend.dev>',
      to: [toEmail],
      subject: \`Resultado de postulación al taller: \${tallerTitulo}\`,
      html: \`
        <h2>Actualización sobre tu postulación</h2>
        <p>Hola,</p>
        <p>Tu postulación al taller <strong>\${tallerTitulo}</strong> ha sido <strong>\${estado}</strong>.</p>
        <p>\${message}</p>
        <br />
        <p>Atentamente,</p>
        <p>El equipo de la Fundación Exalumnos UCR</p>
      \`,
    });
  } catch (error) {
    console.error('Error enviando email de taller (resultado):', error);
  }
}
`;
txt += goodCode;
fs.writeFileSync(file, txt);
console.log('Fixed email service');
