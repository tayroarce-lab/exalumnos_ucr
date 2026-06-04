'use client';

import { MatchFilters } from '@/types/matches';
import { useState } from 'react';

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
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Carrera</label>
        <input 
          type="text" 
          placeholder="Ej: Informática" 
          value={filters.carrera || ''} 
          onChange={(e) => handleChange('carrera', e.target.value)}
          style={{ padding: '0.25rem' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Tipo de Apoyo</label>
        <input 
          type="text" 
          placeholder="Ej: Mentoría" 
          value={filters.tipo_apoyo || ''} 
          onChange={(e) => handleChange('tipo_apoyo', e.target.value)}
          style={{ padding: '0.25rem' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Estado</label>
        <select 
          value={filters.estado || ''} 
          onChange={(e) => handleChange('estado', e.target.value)}
          style={{ padding: '0.25rem' }}
        >
          <option value="">Todos</option>
          <option value="sugerido">Sugerido</option>
          <option value="contactado">Contactado</option>
          <option value="activo">Activo</option>
          <option value="cerrado">Cerrado</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <button onClick={handleApply} style={{ padding: '0.25rem 1rem' }}>
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}
