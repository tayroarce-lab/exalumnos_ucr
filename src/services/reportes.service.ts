import * as reportesRepo from '@/repositories/reportes.repository';
import { fetchUserRole } from '@/repositories/admin.repository';
import { notificarSuspensionAdmin } from '@/lib/email';

export async function processNewReport(reporterId: string, perfilReportado: string, motivo: string, descripcion?: string) {
  if (reporterId === perfilReportado) {
    throw new Error('No puedes reportar tu propio perfil');
  }

  // Insertar el reporte
  await reportesRepo.insertReport(reporterId, perfilReportado, motivo, descripcion);

  // Verificar si el perfil fue suspendido por el trigger (>= 3 reportes)
  const usuarioReportado = await reportesRepo.fetchReportedUserStats(perfilReportado);

  if (usuarioReportado && usuarioReportado.reportes_recibidos >= 3 && usuarioReportado.activo === false) {
    // Buscar todos los admins para notificar
    const admins = await reportesRepo.fetchAllActiveAdmins();

    if (admins.length > 0) {
      const adminEmails = admins.map(a => a.email);
      await notificarSuspensionAdmin(
        adminEmails,
        'Equipo Administrador',
        usuarioReportado.email,
        usuarioReportado.reportes_recibidos
      );
    }
  }

  return { success: true };
}

export async function getPendingReportsList(userId: string) {
  // Validar si el usuario es admin
  const userRole = await fetchUserRole(userId);
  if (userRole !== 'admin') {
    throw new Error('Solo los administradores pueden ver los reportes');
  }

  const reports = await reportesRepo.fetchPendingReports();
  return reports;
}

export async function resolveReport(userId: string, reportId: string) {
  // Validar si el usuario es admin
  const userRole = await fetchUserRole(userId);
  if (userRole !== 'admin') {
    throw new Error('Solo los administradores pueden resolver reportes');
  }

  await reportesRepo.markReportAsResolved(reportId);
  return { success: true };
}
