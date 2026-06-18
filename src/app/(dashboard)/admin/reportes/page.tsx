import { Metadata } from 'next';
import { AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import { getPendingReports } from '@/actions/reports';
import { DenunciasTable } from '../denuncias/_components/denuncias-table';
import '../../../../styles/admin-dashboard.css';
import '../../../../styles/admin-denuncias.css';

export const metadata: Metadata = {
  title: 'Reportes de Usuarios | Admin | Fundación Exalumnos UCR',
  description: 'Panel de moderación para revisar reportes de usuarios hechos por la comunidad.',
};

export default async function AdminReportesPage() {
  let reportes: any[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await getPendingReports();
    if (res.success) {
      reportes = res.data ?? [];
    }
  } catch (err: any) {
    errorMsg = err.message;
  }

  // Estadísticas rápidas
  const totalPendientes = reportes.length;
  const perfilesEnRiesgo = new Set(
    reportes
      .filter(r => (r.reportado?.reportes_recibidos || 0) >= 2)
      .map(r => r.perfil_reportado)
  ).size;

  return (
    <div className="admin-page-container">
      {/* Encabezado */}
      <div className="denuncias-header">
        <div className="denuncias-header-titles">
          <h1>Reportes de Usuarios</h1>
          <p>Revisa y modera los reportes creados por la comunidad. Los perfiles con 3 reportes se suspenden automáticamente.</p>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="denuncias-summary-grid">
        <div className="denuncias-summary-card">
          <div className="denuncias-summary-icon orange">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="denuncias-summary-label">Reportes Pendientes</p>
            <p className="denuncias-summary-value">{totalPendientes}</p>
          </div>
        </div>

        <div className="denuncias-summary-card">
          <div className="denuncias-summary-icon red">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="denuncias-summary-label">Perfiles en Riesgo (2+)</p>
            <p className="denuncias-summary-value">{perfilesEnRiesgo}</p>
          </div>
        </div>

        <div className="denuncias-summary-card">
          <div className="denuncias-summary-icon green">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="denuncias-summary-label">Estado del Sistema</p>
            <p className="denuncias-summary-value" style={{ fontSize: '20px', color: '#16a34a', marginTop: '4px' }}>
              {totalPendientes > 10 ? 'Atención Requerida' : 'Moderado'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Reportes */}
      <main>
        {errorMsg ? (
          <div style={{ background: 'var(--admin-bg-card)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '20px', color: '#dc2626' }}>
            Error al cargar reportes: {errorMsg}
          </div>
        ) : (
          <DenunciasTable initialReportes={reportes} />
        )}
      </main>
    </div>
  );
}
