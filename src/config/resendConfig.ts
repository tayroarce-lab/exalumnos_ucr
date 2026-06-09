import { Resend } from 'resend';

// Validar existencia de la variable de entorno
if (!process.env.RESEND_API_KEY) {
  console.warn('Advertencia: RESEND_API_KEY no está definida en las variables de entorno.');
}

/**
 * Inicializa y exporta el cliente de Resend.
 */
export const clienteResend = new Resend(process.env.RESEND_API_KEY);
