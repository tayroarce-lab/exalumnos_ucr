import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

// Usamos el remitente por defecto de pruebas de Resend según lo acordado para el MVP
export const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev';

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  try {
    const data = await resend.emails.send({
      from: `Fundación Exalumnos UCR <${DEFAULT_FROM_EMAIL}>`,
      to,
      subject,
      html
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error };
  }
}
