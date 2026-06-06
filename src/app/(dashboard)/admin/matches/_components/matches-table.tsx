'use client';

import { useState, useEffect } from 'react';
import { Loader2, Download } from 'lucide-react';
import { MatchAdminView, MatchFilters } from '@/types/matches';
import { getMatches, updateMatch } from '@/actions/matches';
import { MatchesFiltersComponent } from './matches-filters';
import { MatchActionDialog } from './match-action-dialog';
import { exportToCSV } from '@/lib/export-csv';
import '@/styles/admin-table.css';
import '@/styles/admin-matches.css';

export function MatchesTable() {
  const [matches, setMatches] = useState<MatchAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MatchFilters>({});
  const [selectedMatch, setSelectedMatch] = useState<MatchAdminView | null>(null);

  const fetchMatches = async (appliedFilters: MatchFilters) => {
    setLoading(true);
    const { data, error } = await getMatches(appliedFilters);
    if (!error && data) setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: MatchFilters) => {
    setFilters(newFilters);
  };

  // Exportar la tabla actual a CSV
  const handleExportCSV = () => {
    const exportData = matches.map(m => ({
      ID: m.id,
      Exalumno: m.exalumno_nombre,
      Estudiante: m.estudiante_nombre,
      Carrera: m.estudiante_carrera,
      'Tipo de Apoyo': m.tipo_apoyo,
      Score: m.score_match,
      Estado: m.estado,
      Resultado: m.resultado || 'N/A',
      Fecha: new Date(m.created_at).toLocaleDateString('es-CR'),
      'Notas Internas': m.notas_admin || ''
    }));
    exportToCSV('matches_export.csv', exportData);
  };

  const handleSaveMatch = async (
    id: string,
    estado: MatchAdminView['estado'],
    resultado: MatchAdminView['resultado'],
    notas: string | null
  ) => {
    const res = await updateMatch(id, estado, resultado, notas);
    if (res.success) {
      fetchMatches(filters);
    } else {
      alert('Error al actualizar el match');
    }
  };

  // Detectar si un match lleva más de 6 meses activo (alerta visual)
  const checkIsAlertable = (match: MatchAdminView) => {
    if (match.estado !== 'activo') return false;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(match.created_at) < sixMonthsAgo;
  };

  // Determinar clase CSS del badge de estado
  const getStatusClass = (estado: string) => {
    const map: Record<string, string> = {
      sugerido: 'sugerido',
      contactado: 'contactado',
      activo: 'activo',
      cerrado: 'cerrado',
    };
    return `matches-status-pill ${map[estado] || ''}`;
  };

  return (
    <div>
      <MatchesFiltersComponent onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="matches-loading">
          <Loader2 size={28} className="animate-spin" />
          <p>Cargando matches...</p>
        </div>
      ) : (
        <>
          <p className="matches-record-count">{matches.length} match(es) encontrado(s)</p>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Exalumno</th>
                  <th>Estudiante</th>
                  <th>Carrera</th>
                  <th>Tipo Apoyo</th>
                  <th>Score</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No hay matches encontrados con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  matches.map((match) => {
                    const isAlertable = checkIsAlertable(match);
                    return (
                      <tr key={match.id} className={isAlertable ? 'matches-row-alert' : ''}>
                        <td>
                          <div className="admin-table-user">
                            <div className="admin-table-avatar">
                              {match.exalumno_nombre.charAt(0).toUpperCase()}
                            </div>
                            <span>{match.exalumno_nombre}</span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-table-user">
                            <div className="admin-table-avatar" style={{ background: '#ecfdf5', color: '#059669' }}>
                              {match.estudiante_nombre.charAt(0).toUpperCase()}
                            </div>
                            <span>{match.estudiante_nombre}</span>
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>{match.estudiante_carrera}</td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>{match.tipo_apoyo}</td>
                        <td>
                          <span className="matches-score-badge">{match.score_match}%</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className={getStatusClass(match.estado)}>
                              {match.estado.charAt(0).toUpperCase() + match.estado.slice(1)}
                            </span>
                            {isAlertable && (
                              <span className="matches-alert-badge">⚠ +6 meses activo</span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>
                          {new Date(match.created_at).toLocaleDateString('es-CR')}
                        </td>
                        <td>
                          <button
                            className="matches-action-btn"
                            onClick={() => setSelectedMatch(match)}
                          >
                            Gestionar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <MatchActionDialog
        isOpen={!!selectedMatch}
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onSave={handleSaveMatch}
      />
    </div>
  );
}
