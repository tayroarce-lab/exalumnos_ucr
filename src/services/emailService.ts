import { clienteResend } from '../config/resendConfig';

export interface OpcionesCorreo {
  destinatario: string | string[];
  asunto: string;
  cuerpoHtml: string;
}

/**
 * Servicio genérico para el envío de correos transaccionales vía Resend.
 * @param opciones - Contiene destinatario, asunto y el cuerpo en HTML estructurado.
 * @returns Promesa con los datos de envío de Resend.
 */
export async function enviarCorreoNotificacion({ destinatario, asunto, cuerpoHtml }: OpcionesCorreo) {
  try {
    const respuesta = await clienteResend.emails.send({
      from: 'Notificaciones UCR <onboarding@resend.dev>', // Modificar con el dominio de la institución en producción
      to: destinatario,
      subject: asunto,
      html: cuerpoHtml,
    });

    if (respuesta.error) {
      throw new Error(`Fallo de Resend: ${respuesta.error.message}`);
    }

    return respuesta.data;
  } catch (error) {
    console.error('Error al enviar correo de notificación:', error);
    throw error;
  }
}
