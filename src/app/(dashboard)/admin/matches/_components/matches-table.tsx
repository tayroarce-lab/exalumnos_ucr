'use client';

import { useState, useEffect } from 'react';
import { MatchAdminView, MatchFilters } from '@/types/matches';
import { getMatches, updateMatch } from '@/actions/matches';
import { MatchesFiltersComponent } from './matches-filters';
import { MatchActionDialog } from './match-action-dialog';
import { exportToCSV } from '@/lib/export-csv';

export function MatchesTable() {
  const [matches, setMatches] = useState<MatchAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MatchFilters>({});
  const [selectedMatch, setSelectedMatch] = useState<MatchAdminView | null>(null);

  const fetchMatches = async (appliedFilters: MatchFilters) => {
    setLoading(true);
    const { data, error } = await getMatches(appliedFilters);
    if (!error && data) {
      setMatches(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: MatchFilters) => {
    setFilters(newFilters);
  };

  const handleExportCSV = () => {
    // Preparar datos para CSV (aplanar objetos si es necesario)
    const exportData = matches.map(m => ({
      ID: m.id,
      Exalumno: m.exalumno_nombre,
      Estudiante: m.estudiante_nombre,
      Carrera: m.estudiante_carrera,
      'Tipo de Apoyo': m.tipo_apoyo,
      Score: m.score_match,
      Estado: m.estado,
      Resultado: m.resultado || 'N/A',
      Fecha: new Date(m.created_at).toLocaleDateString(),
      'Notas Internas': m.notas_admin || ''
    }));
    exportToCSV('matches_export.csv', exportData);
  };

  const handleSaveMatch = async (id: string, estado: MatchAdminView['estado'], resultado: MatchAdminView['resultado'], notas: string | null) => {
    const res = await updateMatch(id, estado, resultado, notas);
    if (res.success) {
      // Refrescar tabla
      fetchMatches(filters);
    } else {
      alert('Error al actualizar el match');
    }
  };

  // Función para determinar si el match tiene más de 6 meses activo
  const checkIsAlertable = (match: MatchAdminView) => {
    if (match.estado !== 'activo') return false;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const matchDate = new Date(match.created_at);
    return matchDate < sixMonthsAgo;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Gestión de Matches</h2>
        <button onClick={handleExportCSV} style={{ padding: '0.5rem 1rem' }}>
          Exportar a CSV
        </button>
      </div>

      <MatchesFiltersComponent onFilterChange={handleFilterChange} />

      {loading ? (
        <p>Cargando matches...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '0.5rem' }}>Exalumno</th>
              <th style={{ padding: '0.5rem' }}>Estudiante</th>
              <th style={{ padding: '0.5rem' }}>Carrera</th>
              <th style={{ padding: '0.5rem' }}>Tipo Apoyo</th>
              <th style={{ padding: '0.5rem' }}>Score</th>
              <th style={{ padding: '0.5rem' }}>Estado</th>
              <th style={{ padding: '0.5rem' }}>Fecha</th>
              <th style={{ padding: '0.5rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '1rem', textAlign: 'center' }}>No hay matches encontrados.</td>
              </tr>
            ) : (
              matches.map((match) => {
                const isAlertable = checkIsAlertable(match);
                return (
                  <tr key={match.id} style={{ borderBottom: '1px solid #eee', backgroundColor: isAlertable ? '#fff3cd' : 'transparent' }}>
                    <td style={{ padding: '0.5rem' }}>{match.exalumno_nombre}</td>
                    <td style={{ padding: '0.5rem' }}>{match.estudiante_nombre}</td>
                    <td style={{ padding: '0.5rem' }}>{match.estudiante_carrera}</td>
                    <td style={{ padding: '0.5rem' }}>{match.tipo_apoyo}</td>
                    <td style={{ padding: '0.5rem' }}>{match.score_match}%</td>
                    <td style={{ padding: '0.5rem' }}>
                      {match.estado}
                      {isAlertable && (
                        <span style={{ color: 'red', fontSize: '0.75rem', display: 'block', fontWeight: 'bold' }}>
                          ⚠️ +6 meses activo
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{new Date(match.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button onClick={() => setSelectedMatch(match)}>Gestionar</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
