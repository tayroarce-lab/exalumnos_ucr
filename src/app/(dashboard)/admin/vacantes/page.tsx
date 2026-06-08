import { Metadata } from 'next';
import { Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';
import { listarTodasLasVacantes } from '@/actions/admin';
import { VacantesTable } from './_components/vacantes-table';
import '../../../../styles/admin-dashboard.css';
import '../../../../styles/admin-vacantes.css';

export const metadata: Metadata = {
  title: 'Gestión de Vacantes | Admin | Fundación Exalumnos UCR',
  description: 'Panel de administración para supervisar y gestionar las vacantes publicadas por exalumnos.',
};

export default async function AdminVacantesPage() {
  // Cargar todas las vacantes desde el servidor usando el cliente admin (bypass RLS)
  let vacantes: any[] = [];
  let errorMsg: string | null = null;

  try {
    const data = await listarTodasLasVacantes();
    vacantes = data ?? [];
  } catch (err: any) {
    errorMsg = err.message;
  }

  // Estadísticas por estado para las tarjetas de resumen
  const totalActivas  = vacantes.filter(v => v.estado === 'activa').length;
  const totalPausadas = vacantes.filter(v => v.estado === 'pausada').length;
  const totalCerradas = vacantes.filter(v => v.estado === 'cerrada').length;
  const totalCubiertas = vacantes.filter(v => v.estado === 'cubierta').length;

  return (
    <div className="admin-page-container">
      {/* Encabezado de la página */}
      <div className="vacantes-header">
        <div className="vacantes-header-titles">
          <h1>Gestión de Vacantes</h1>
          <p>Supervisa las ofertas de empleo y pasantías publicadas por los exalumnos.</p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="vacantes-summary-grid">
        <div className="vacantes-summary-card">
          <div className="vacantes-summary-icon green">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="vacantes-summary-label">Activas</p>
            <p className="vacantes-summary-value">{totalActivas}</p>
          </div>
        </div>

        <div className="vacantes-summary-card">
          <div className="vacantes-summary-icon amber">
            <Clock size={22} />
          </div>
          <div>
            <p className="vacantes-summary-label">Pausadas</p>
            <p className="vacantes-summary-value">{totalPausadas}</p>
          </div>
        </div>

        <div className="vacantes-summary-card">
          <div className="vacantes-summary-icon blue">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="vacantes-summary-label">Cubiertas</p>
            <p className="vacantes-summary-value">{totalCubiertas}</p>
          </div>
        </div>

        <div className="vacantes-summary-card">
          <div className="vacantes-summary-icon slate">
            <XCircle size={22} />
          </div>
          <div>
            <p className="vacantes-summary-label">Cerradas</p>
            <p className="vacantes-summary-value">{totalCerradas}</p>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <main>
        {errorMsg ? (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            padding: '20px',
            color: '#dc2626'
          }}>
            Error al cargar vacantes: {errorMsg}
          </div>
        ) : (
          <VacantesTable initialVacantes={vacantes} />
        )}
      </main>
    </div>
  );
}
