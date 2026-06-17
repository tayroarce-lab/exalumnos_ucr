'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { actualizarEstadoVacanteAdmin, eliminarPosicionAdmin } from '@/actions/admin';
import '../../../../../styles/admin-table.css';
import '../../../../../styles/admin-vacantes.css';

type EstadoVacante = 'activa' | 'pausada' | 'cerrada' | 'cubierta';

interface Vacante {
  id: string;
  titulo: string;
  tipo: 'empleo' | 'pasantia';
  modalidad: string;
  empresa: string;
  lugar: string;
  estado: EstadoVacante;
  fecha_limite: string | null;
  created_at: string;
  exalumno: {
    nombre: string;
    email: string;
  } | null;
}

interface VacantesTableProps {
  initialVacantes: Vacante[];
}

export function VacantesTable({ initialVacantes }: VacantesTableProps) {
  const [vacantes, setVacantes] = useState<Vacante[]>(initialVacantes);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filtrado local por búsqueda, estado y tipo
  const filtered = vacantes.filter(v => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.titulo?.toLowerCase().includes(q) ||
      v.empresa?.toLowerCase().includes(q) ||
      v.exalumno?.nombre?.toLowerCase().includes(q);
    const matchesEstado = filterEstado === 'all' || v.estado === filterEstado;
    const matchesTipo = filterTipo === 'all' || v.tipo === filterTipo;
    return matchesSearch && matchesEstado && matchesTipo;
  });

  // Actualizar estado de una vacante de forma optimista
  const handleEstadoChange = async (id: string, nuevoEstado: EstadoVacante) => {
    setLoadingId(id);
    try {
      await actualizarEstadoVacanteAdmin(id, nuevoEstado);
      setVacantes(prev =>
        prev.map(v => v.id === id ? { ...v, estado: nuevoEstado } : v)
      );
    } catch (err: any) {
      alert(`Error al actualizar vacante: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  // Eliminar una vacante como administrador
  const handleEliminarClick = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta vacante? Esta acción no se puede deshacer.')) {
      return;
    }
    setLoadingId(id);
    try {
      await eliminarPosicionAdmin(id);
      setVacantes(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      alert(`Error al eliminar vacante: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  // Verificar si una fecha límite ya expiró
  const isExpired = (fecha: string | null) => {
    if (!fecha) return false;
    return new Date(fecha) < new Date();
  };

  const getModalidadLabel = (m: string) => {
    const map: Record<string, string> = {
      presencial: 'Presencial',
      remoto: 'Remoto',
      hibrido: 'Híbrido',
    };
    return map[m] || m;
  };

  return (
    <div>
      {/* Barra de filtros */}
      <div className="vacantes-filters-bar">
        <div className="vacantes-search-wrapper">
          <Search className="vacantes-search-icon" size={16} />
          <input
            type="text"
            className="vacantes-search-input"
            placeholder="Buscar por título, empresa o exalumno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="vacantes-filter-group">
          <label className="vacantes-filter-label">Estado</label>
          <select
            className="vacantes-filter-select"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="activa">Activa</option>
            <option value="pausada">Pausada</option>
            <option value="cerrada">Cerrada</option>
            <option value="cubierta">Cubierta</option>
          </select>
        </div>

        <div className="vacantes-filter-group">
          <label className="vacantes-filter-label">Tipo</label>
          <select
            className="vacantes-filter-select"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="empleo">Empleo</option>
            <option value="pasantia">Pasantía</option>
          </select>
        </div>
      </div>

      <p className="vacantes-record-count">{filtered.length} vacante(s) encontrada(s)</p>

      {filtered.length === 0 ? (
        <div className="vacantes-empty-state">
          No hay vacantes con los filtros aplicados.
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vacante</th>
                <th>Exalumno</th>
                <th>Tipo</th>
                <th>Modalidad</th>
                <th>Fecha Límite</th>
                <th>Estado</th>
                <th>Gestionar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(vacante => (
                <tr key={vacante.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: '#0A2540', fontSize: '14px' }}>
                        {vacante.titulo}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {vacante.empresa} · {vacante.lugar}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table-user">
                      <div className="admin-table-avatar" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        {(vacante.exalumno?.nombre || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 500, fontSize: '13px' }}>
                          {vacante.exalumno?.nombre || 'Desconocido'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {vacante.exalumno?.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`vacantes-tipo-pill ${vacante.tipo}`}>
                      {vacante.tipo === 'empleo' ? 'Empleo' : 'Pasantía'}
                    </span>
                  </td>
                  <td>
                    <span className="vacantes-modalidad-badge">
                      {getModalidadLabel(vacante.modalidad)}
                    </span>
                  </td>
                  <td>
                    {vacante.fecha_limite ? (
                      <span className={isExpired(vacante.fecha_limite) ? 'vacantes-deadline-expired' : 'vacantes-deadline-ok'}>
                        {isExpired(vacante.fecha_limite) ? '⚠ ' : ''}
                        {new Date(vacante.fecha_limite).toLocaleDateString('es-CR')}
                      </span>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Sin límite</span>
                    )}
                  </td>
                  <td>
                    <span className={`vacantes-status-pill ${vacante.estado}`}>
                      {vacante.estado.charAt(0).toUpperCase() + vacante.estado.slice(1)}
                    </span>
                  </td>
                  <td>
                    {loadingId === vacante.id ? (
                      <Loader2 size={18} className="animate-spin" style={{ color: '#94a3b8' }} />
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          className="vacantes-action-select"
                          value={vacante.estado}
                          onChange={(e) => handleEstadoChange(vacante.id, e.target.value as EstadoVacante)}
                        >
                          <option value="activa">Activar</option>
                          <option value="pausada">Pausar</option>
                          <option value="cerrada">Cerrar</option>
                          <option value="cubierta">Marcar Cubierta</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleEliminarClick(vacante.id)}
                          style={{
                            background: '#fee2e2',
                            color: '#ef4444',
                            border: '1px solid #fca5a5',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#fca5a5';
                            e.currentTarget.style.color = '#b91c1c';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
