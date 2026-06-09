'use client';

import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { resolverReporte } from '@/actions/reportes';
import '../../../../../styles/admin-table.css';
import '../../../../../styles/admin-denuncias.css';

interface UserInfo {
  nombre: string;
  email: string;
  reportes_recibidos?: number;
}

interface Reporte {
  id: string;
  reportado_por: string;
  perfil_reportado: string;
  motivo: string;
  descripcion: string;
  resuelto: boolean;
  created_at: string;
  denunciante?: UserInfo | null;
  reportado?: UserInfo | null;
}

interface DenunciasTableProps {
  initialReportes: Reporte[];
}

export function DenunciasTable({ initialReportes }: DenunciasTableProps) {
  const [reportes, setReportes] = useState<Reporte[]>(initialReportes);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleResolver = async (id: string) => {
    setLoadingId(id);
    try {
      await resolverReporte(id);
      // Actualizar localmente removiendo el reporte de la lista de pendientes
      setReportes(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert(`Error al resolver el reporte: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <p className="users-record-count" style={{ marginBottom: '16px', color: '#94a3b8', fontSize: '13px' }}>
        {reportes.length} reporte(s) pendiente(s) de revisión
      </p>

      {reportes.length === 0 ? (
        <div className="denuncias-empty-state">
          <CheckCircle size={48} style={{ color: '#10B981', marginBottom: '16px' }} />
          <p style={{ color: '#0A2540', fontWeight: 600, margin: '0 0 4px 0' }}>¡Todo al día!</p>
          <p style={{ margin: 0 }}>No hay denuncias pendientes por revisar.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Denunciante</th>
                <th>Perfil Reportado</th>
                <th>Motivo y Descripción</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map(reporte => {
                const isHighRisk = (reporte.reportado?.reportes_recibidos || 0) >= 2;
                return (
                  <tr key={reporte.id}>
                    {/* Denunciante */}
                    <td>
                      <div className="denuncias-user-box">
                        <span className="name">{reporte.denunciante?.nombre || 'Desconocido'}</span>
                        <span className="email">{reporte.denunciante?.email}</span>
                      </div>
                    </td>
                    
                    {/* Reportado */}
                    <td>
                      <div className="denuncias-user-box">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="name">{reporte.reportado?.nombre || 'Desconocido'}</span>
                          <span 
                            className={`denuncias-count-badge ${isHighRisk ? 'high' : 'low'}`}
                            title={`Reportes acumulados: ${reporte.reportado?.reportes_recibidos || 1}`}
                          >
                            {reporte.reportado?.reportes_recibidos || 1}
                          </span>
                        </div>
                        <span className="email">{reporte.reportado?.email}</span>
                      </div>
                    </td>
                    
                    {/* Motivo */}
                    <td>
                      <div className="denuncias-motivo-box">
                        <div className="denuncias-motivo-title">{reporte.motivo}</div>
                        {reporte.descripcion && (
                          <div className="denuncias-motivo-desc">{reporte.descripcion}</div>
                        )}
                      </div>
                    </td>
                    
                    {/* Fecha */}
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(reporte.created_at).toLocaleDateString('es-CR', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    
                    {/* Acciones */}
                    <td>
                      <button
                        className="denuncias-btn-resolve"
                        onClick={() => handleResolver(reporte.id)}
                        disabled={loadingId === reporte.id}
                      >
                        {loadingId === reporte.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Resolver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
