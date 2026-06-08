'use client';

import { MatchFilters } from '@/types/matches';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import '../../../../../styles/admin-matches.css';

interface MatchesFiltersProps {
  onFilterChange: (filters: MatchFilters) => void;
}

export function MatchesFiltersComponent({ onFilterChange }: MatchesFiltersProps) {
  const [filters, setFilters] = useState<MatchFilters>({
    carrera: '',
    tipo_apoyo: '',
    estado: '',
  });

  const handleChange = (key: keyof MatchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const reset = { carrera: '', tipo_apoyo: '', estado: '' };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <div className="matches-filters-bar">
      <SlidersHorizontal size={18} style={{ color: '#94a3b8', marginBottom: '2px', flexShrink: 0 }} />

      <div className="matches-filter-group">
        <label className="matches-filter-label">Carrera</label>
        <input
          type="text"
          className="matches-filter-input"
          placeholder="Ej: Informática"
          value={filters.carrera || ''}
          onChange={(e) => handleChange('carrera', e.target.value)}
        />
      </div>

      <div className="matches-filter-group">
        <label className="matches-filter-label">Tipo de Apoyo</label>
        <input
          type="text"
          className="matches-filter-input"
          placeholder="Ej: Mentoría"
          value={filters.tipo_apoyo || ''}
          onChange={(e) => handleChange('tipo_apoyo', e.target.value)}
        />
      </div>

      <div className="matches-filter-group">
        <label className="matches-filter-label">Estado</label>
        <select
          className="matches-filter-select"
          value={filters.estado || ''}
          onChange={(e) => handleChange('estado', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="sugerido">Sugerido</option>
          <option value="contactado">Contactado</option>
          <option value="activo">Activo</option>
          <option value="cerrado">Cerrado</option>
        </select>
      </div>

      <button className="matches-filter-btn" onClick={handleApply}>
        Aplicar
      </button>
      <button
        onClick={handleReset}
        style={{
          padding: '9px 16px',
          background: 'transparent',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#64748b',
          cursor: 'pointer'
        }}
      >
        Limpiar
      </button>
    </div>
  );
}
