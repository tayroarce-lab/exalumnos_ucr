"use client";

import React, { useState, useEffect } from "react";
import { FiltrosDirectorio } from "@/types/estudiantes";
import { MOCK_AREAS_CARRERAS, MOCK_SEDES, MOCK_TIPOS_PROYECTO, MOCK_TIPOS_APOYO } from "@/constants/areas-carreras";

interface PanelFiltrosProps {
  filtros: FiltrosDirectorio;
  onChange: (nuevosFiltros: FiltrosDirectorio) => void;
}

export default function PanelFiltros({ filtros, onChange }: PanelFiltrosProps) {
  const [areasDisponibles] = useState(Object.keys(MOCK_AREAS_CARRERAS));
  const [carrerasDisponibles, setCarrerasDisponibles] = useState<string[]>([]);

  // Actualizar carreras disponibles cuando cambia el área temática
  useEffect(() => {
    let nuevasCarreras: string[] = [];
    if (filtros.proyecto_area_tematica.length > 0) {
      filtros.proyecto_area_tematica.forEach((area) => {
        if (MOCK_AREAS_CARRERAS[area]) {
          nuevasCarreras = [...nuevasCarreras, ...MOCK_AREAS_CARRERAS[area]];
        }
      });
    } else {
      // Si no hay áreas seleccionadas, mostrar todas las carreras o dejarlas vacías
      // En este caso, según el requerimiento, la carrera depende del área.
      // Si no hay área, podemos dejar las carreras vacías o mostrar todas. Dejemos vacío.
      nuevasCarreras = [];
    }
    
    // Limpiar las carreras seleccionadas que ya no están disponibles
    const carrerasFiltradas = filtros.carrera.filter(c => nuevasCarreras.includes(c));
    
    setCarrerasDisponibles(nuevasCarreras);
    
    if (carrerasFiltradas.length !== filtros.carrera.length) {
      onChange({ ...filtros, carrera: carrerasFiltradas });
    }
  }, [filtros.proyecto_area_tematica]);

  const handleAreaChange = (area: string, checked: boolean) => {
    const nuevasAreas = checked 
      ? [...filtros.proyecto_area_tematica, area]
      : filtros.proyecto_area_tematica.filter(a => a !== area);
      
    onChange({ ...filtros, proyecto_area_tematica: nuevasAreas });
  };

  const handleCarreraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({ ...filtros, carrera: value ? [value] : [] });
  };

  const handleTipoApoyoChange = (id: string, checked: boolean) => {
    const nuevos = checked
      ? [...filtros.tipos_apoyo, id]
      : filtros.tipos_apoyo.filter(t => t !== id);
    onChange({ ...filtros, tipos_apoyo: nuevos });
  };

  const limpiarFiltros = () => {
    onChange({
      carrera: [],
      proyecto_area_tematica: [],
      areas_de_interes: [],
      tipos_apoyo: [],
      proyecto_tipo: "",
      sede: "",
    });
  };

  // Contar filtros activos
  const filtrosActivos = 
    filtros.carrera.length + 
    filtros.proyecto_area_tematica.length + 
    filtros.tipos_apoyo.length + 
    (filtros.proyecto_tipo ? 1 : 0) + 
    (filtros.sede ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header del panel */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-esmeralda">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Filtros</h2>
        {filtrosActivos > 0 && (
          <span className="ml-auto bg-esmeralda text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {filtrosActivos}
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Carrera */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Carrera</h3>
          <select 
            className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-esmeralda/30 focus:border-esmeralda disabled:bg-slate-50 disabled:text-slate-400 transition-all duration-200 appearance-none cursor-pointer"
            value={filtros.carrera[0] || ""}
            onChange={handleCarreraChange}
            disabled={carrerasDisponibles.length === 0}
          >
            <option value="">Todas las carreras</option>
            {carrerasDisponibles.map((carrera) => (
              <option key={carrera} value={carrera}>{carrera}</option>
            ))}
          </select>
          {carrerasDisponibles.length === 0 && (
            <p className="text-[10px] text-slate-400 mt-1.5 pl-1">Selecciona un área temática primero</p>
          )}
        </div>

        {/* Área Temática */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Área Temática</h3>
          <div className="space-y-1.5">
            {areasDisponibles.map((area) => (
              <label key={area} className="flex items-center gap-2.5 cursor-pointer group px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-150">
                <input 
                  type="checkbox"
                  checked={filtros.proyecto_area_tematica.includes(area)}
                  onChange={(e) => handleAreaChange(area, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-esmeralda focus:ring-esmeralda/30 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors duration-150">{area}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tipo de Proyecto */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Tipo de Proyecto</h3>
          <select 
            className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-esmeralda/30 focus:border-esmeralda transition-all duration-200 appearance-none cursor-pointer"
            value={filtros.proyecto_tipo}
            onChange={(e) => onChange({ ...filtros, proyecto_tipo: e.target.value })}
          >
            <option value="">Todos los tipos</option>
            {MOCK_TIPOS_PROYECTO.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Tipo de Apoyo Buscado */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Busca Apoyo En</h3>
          <div className="space-y-1.5">
            {MOCK_TIPOS_APOYO.map((apoyo) => (
              <label key={apoyo.id} className="flex items-center gap-2.5 cursor-pointer group px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-150">
                <input 
                  type="checkbox"
                  checked={filtros.tipos_apoyo.includes(apoyo.id)}
                  onChange={(e) => handleTipoApoyoChange(apoyo.id, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-esmeralda focus:ring-esmeralda/30 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors duration-150">{apoyo.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sede UCR */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Sede UCR</h3>
          <select 
            className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-esmeralda/30 focus:border-esmeralda transition-all duration-200 appearance-none cursor-pointer"
            value={filtros.sede}
            onChange={(e) => onChange({ ...filtros, sede: e.target.value })}
          >
            <option value="">Todas las sedes</option>
            {MOCK_SEDES.map((sede) => (
              <option key={sede} value={sede}>{sede}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón Limpiar Filtros */}
      <div className="px-5 pb-5">
        <button 
          onClick={limpiarFiltros}
          disabled={filtrosActivos === 0}
          className="w-full py-2.5 text-sm font-semibold rounded-xl border-2 border-slate-200 text-slate-500 bg-white hover:border-esmeralda hover:text-esmeralda disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wide"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
