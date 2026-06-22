import { sendEmail } from './client';
import { 
  getDonacionConfirmadaTemplate, 
  getNuevaAplicacionTemplate, 
  getNuevoMatchTemplate,
  getAlertaSuspensionTemplate,
  getRecordatorioDonacionTemplate,
  getAlertaMatchAntiguoTemplate,
  getNuevaDonacionAdminTemplate,
  getEstadoDonacionTemplate
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

export async function notificarSuspensionAdmin(toEmails: string[], nombreAdmin: string, emailReportado: string, cantidadReportes: number) {
  const html = getAlertaSuspensionTemplate(nombreAdmin, emailReportado, cantidadReportes);
  return sendEmail({
    to: toEmails,
    subject: '⚠️ Alerta: Cuenta suspendida automáticamente',
    html
  });
}

export async function notificarDonacionAtrasadaAdmin(toEmails: string[], nombreAdmin: string, monto: number, moneda: string, emailExalumno: string, fechaTransferencia: string) {
  const html = getRecordatorioDonacionTemplate(nombreAdmin, monto, moneda, emailExalumno, fechaTransferencia);
  return sendEmail({
    to: toEmails,
    subject: '⏳ Acción requerida: Donación pendiente por más de 48h',
    html
  });
}

export async function notificarMatchAntiguoAdmin(toEmails: string[], nombreAdmin: string, emailExalumno: string, emailEstudiante: string, fechaCreacion: string) {
  const html = getAlertaMatchAntiguoTemplate(nombreAdmin, emailExalumno, emailEstudiante, fechaCreacion);
  return sendEmail({
    to: toEmails,
    subject: '🗓️ Seguimiento requerido: Match activo por más de 6 meses',
    html
  });
}

export async function notificarNuevaDonacionAdmin(toEmail: string, monto: number, moneda: string, proyecto: string, metodo: string) {
  const html = getNuevaDonacionAdminTemplate(monto, moneda, proyecto, metodo);
  return sendEmail({
    to: toEmail,
    subject: '🔔 Nueva Donación Pendiente de Revisión',
    html
  });
}

export async function notificarEstadoDonacion(toEmail: string, nombreExalumno: string, estado: string, monto: number, moneda: string, motivoRechazo?: string) {
  const html = getEstadoDonacionTemplate(nombreExalumno, estado, monto, moneda, motivoRechazo);
  return sendEmail({
    to: toEmail,
    subject: estado === 'confirmada' ? '¡Tu donación ha sido confirmada! 🎉' : 'Actualización sobre tu donación',
    html
  });
}
