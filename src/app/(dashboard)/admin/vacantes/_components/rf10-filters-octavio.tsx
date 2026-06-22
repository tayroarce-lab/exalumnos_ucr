'use client';

import { Search } from 'lucide-react';
import { CARRERAS_UCR } from '@/constants/catalogs';

export interface RF10FiltrosState {
  search: string;
  tipo: string;
  carrera: string;
  modalidad: string;
  estado: string;
}

interface RF10FiltersProps {
  filtros: RF10FiltrosState;
  onChange: (nuevosFiltros: Partial<RF10FiltrosState>) => void;
  onClear: () => void;
}

// =============================================================================
// COMPONENTE: RF10Filters
// Descripción: Panel de filtros responsivo para el listado de vacantes.
//              Implementado utilizando Tailwind CSS para estilos modernos y limpios.
// =============================================================================
export function RF10Filters({ filtros, onChange, onClear }: RF10FiltersProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex flex-col gap-4">
      
      {/* Grid de inputs de filtro principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Búsqueda de texto (Título, Empresa, Exalumno) */}
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Búsqueda de texto
          </span>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50/30"
              placeholder="Buscar por título, empresa o exalumno..."
              value={filtros.search}
              onChange={(e) => onChange({ search: e.target.value })}
            />
          </div>
        </div>

        {/* Tipo de publicación */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tipo
          </span>
          <select
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50/30 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            value={filtros.tipo}
            onChange={(e) => onChange({ tipo: e.target.value })}
          >
            <option value="all">Todos</option>
            <option value="empleo">Empleo</option>
            <option value="pasantia">Pasantía</option>
          </select>
        </div>

        {/* Modalidad de la oferta */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Modalidad
          </span>
          <select
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50/30 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            value={filtros.modalidad}
            onChange={(e) => onChange({ modalidad: e.target.value })}
          >
            <option value="all">Todas</option>
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
            <option value="hibrido">Híbrida</option>
          </select>
        </div>

        {/* Estado actual en el flujo */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Estado
          </span>
          <select
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50/30 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            value={filtros.estado}
            onChange={(e) => onChange({ estado: e.target.value })}
          >
            <option value="all">Todos</option>
            <option value="activa">Activa</option>
            <option value="pausada">Pausada</option>
            <option value="cerrada">Cerrada</option>
            <option value="cubierta">Cubierta</option>
          </select>
        </div>

      </div>

      {/* Fila inferior para Carrera y botón de Limpieza */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
        
        {/* Selección por Carrera del Exalumno */}
        <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:flex-1 max-w-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Carrera del exalumno
          </span>
          <select
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50/30 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            value={filtros.carrera}
            onChange={(e) => onChange({ carrera: e.target.value })}
          >
            <option value="all">Todas las carreras</option>
            {CARRERAS_UCR.map((carrera) => (
              <option key={carrera} value={carrera}>
                {carrera}
              </option>
            ))}
          </select>
        </div>

        {/* Acción limpiar */}
        <button
          type="button"
          onClick={onClear}
          className="w-full sm:w-auto self-end px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all text-sm font-semibold flex items-center justify-center gap-2"
        >
          Limpiar filtros
        </button>

      </div>
    </div>
  );
}
