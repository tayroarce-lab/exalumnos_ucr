import { sendEmail } from './client';
import { 
  getDonacionConfirmadaTemplate, 
  getNuevaAplicacionTemplate, 
  getNuevoMatchTemplate 
} from './templates';

export async function notificarDonacionAprobada(toEmail: string, nombreEstudiante: string, monto: number, moneda: string) {
  const html = getDonacionConfirmadaTemplate(nombreEstudiante, monto, moneda);
  return sendEmail({
    to: toEmail,
    subject: '¡Han confirmado una donación para tu proyecto! 🎉',
    html
  });
}

export async function notificarNuevaAplicacion(toEmail: string, nombreExalumno: string, tituloPosicion: string, nombreEstudiante: string) {
  const html = getNuevaAplicacionTemplate(nombreExalumno, tituloPosicion, nombreEstudiante);
  return sendEmail({
    to: toEmail,
    subject: 'Nueva aplicación a tu vacante 📄',
    html
  });
}

export async function notificarNuevoMatch(toEmail: string, nombreUsuario: string, tipoMatch: string) {
  const html = getNuevoMatchTemplate(nombreUsuario, tipoMatch);
  return sendEmail({
    to: toEmail,
    subject: 'Nuevo Match sugerido en la plataforma 🤝',
    html
  });
}
