import { Resend } from 'resend';

// Inicializa el cliente de Resend. Asegúrate de tener RESEND_API_KEY en tu .env
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

/**
 * Envía correos de confirmación tanto al donante como al estudiante.
 * Sends confirmation emails to both donor and student.
 */
export async function sendDonationConfirmationEmails(
  donorEmail: string, 
  studentEmail: string, 
  amount: number, 
  currency: string
) {
  try {
    // 1. Email al donante (Donor)
    await resend.emails.send({
      from: 'Fundación Exalumnos UCR <donaciones@fundacion.ucr.ac.cr>',
      to: donorEmail,
      subject: '¡Gracias por tu donación! / Thank you for your donation!',
      html: `
        <p>Hola,</p>
        <p>Hemos confirmado tu donación de <strong>${currency} ${amount}</strong>.</p>
        <p>¡Gracias por apoyar a los estudiantes de la UCR!</p>
      `
    });

    // 2. Email al estudiante (Student)
    await resend.emails.send({
      from: 'Fundación Exalumnos UCR <donaciones@fundacion.ucr.ac.cr>',
      to: studentEmail,
      subject: '¡Has recibido una donación confirmada!',
      html: `
        <p>Hola,</p>
        <p>Te informamos que una donación de <strong>${currency} ${amount}</strong> dirigida a tu proyecto ha sido confirmada por la Fundación.</p>
        <p>Sigue adelante con tu excelente trabajo.</p>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    return { success: false, error };
  }
}

/**
 * Envía un correo de rechazo al donante con el motivo obligatorio.
 * Sends a rejection email to the donor with the mandatory reason.
 */
export async function sendDonationRejectionEmail(
  donorEmail: string, 
  rejectionReason: string
) {
  try {
    await resend.emails.send({
      from: 'Fundación Exalumnos UCR <donaciones@fundacion.ucr.ac.cr>',
      to: donorEmail,
      subject: 'Problema con tu reporte de donación',
      html: `
        <p>Hola,</p>
        <p>Hemos revisado el reporte de donación que enviaste, pero lamentablemente no pudimos confirmarlo por la siguiente razón:</p>
        <blockquote style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
          ${rejectionReason}
        </blockquote>
        <p>Por favor, revisa la información o contáctanos si crees que es un error.</p>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error };
  }
}
