"use client";

import React, { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import PanelFiltros from "./PanelFiltros";
import GrillaEstudiantes from "./GrillaEstudiantes";
import BarraBusqueda from "./BarraBusqueda";
import Paginacion from "./Paginacion";
import { FiltrosDirectorio, EstudianteDirectorio } from "@/types/estudiantes";
import { getEstudiantes } from "@/lib/api";
import { buildQueryString } from "@/lib/url-utils";

const ITEMS_POR_PAGINA = 12;

interface TodosClientProps {
  estudiantesIniciales: EstudianteDirectorio[];
  totalInicial: number;
  filtrosIniciales: FiltrosDirectorio;
  busquedaInicial: string;
  paginaInicial: number;
}

export default function TodosClient({ 
  estudiantesIniciales, 
  totalInicial,
  filtrosIniciales,
  busquedaInicial,
  paginaInicial
}: TodosClientProps) {
  // Estado UI
  const [filtros, setFiltros] = useState<FiltrosDirectorio>(filtrosIniciales);
  
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [paginaActual, setPaginaActual] = useState(paginaInicial);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  // Estado de Datos (Inicializado con props del servidor)
  const [estudiantes, setEstudiantes] = useState<EstudianteDirectorio[]>(estudiantesIniciales);
  const [totalItems, setTotalItems] = useState(totalInicial);
  const [isPending, setIsPending] = useState(false);
  
  const isFirstRender = useRef(true);

  // 1. Efecto Local: Resetear página a 1 cuando cambian filtros o búsqueda
  useEffect(() => {
    if (isFirstRender.current) return;
    setPaginaActual(1);
  }, [filtros, busqueda]);

  // 2. Efecto Servidor: Obtener datos paginados y filtrados vía API centralizada con Debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Debounce de 300ms
    const handler = setTimeout(async () => {
      setIsPending(true);

      // Actualizar URL silenciosamente sin recargar Server Component
      const newUrl = `${window.location.pathname}${buildQueryString(filtros, busqueda, paginaActual)}`;
      window.history.replaceState(null, '', newUrl);

      try {
        const { estudiantes: data, total } = await getEstudiantes(filtros, {
          busqueda,
          page: paginaActual,
          limit: ITEMS_POR_PAGINA
        });
        setEstudiantes(data);
        setTotalItems(total);
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
      } finally {
        setIsPending(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [filtros, busqueda, paginaActual]);

  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA) || 1;
  const activeFilterCount = (filtros.carrera.length) + (filtros.proyecto_area_tematica.length) + (filtros.tipos_apoyo.length) + (filtros.proyecto_tipo ? 1 : 0) + (filtros.sede ? 1 : 0);

  return (
    <div className="w-full flex flex-col">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase font-display text-white tracking-wide drop-shadow-sm">Todos los Estudiantes</h1>
          <p className="text-xs sm:text-sm text-slate-100 font-medium">Explora el directorio completo de proyectos.</p>
        </div>
        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            onClick={() => setShowFiltersModal(true)}
            className="h-11 px-5 flex items-center justify-center gap-2 bg-[#003B4F] hover:bg-[#002735] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#F34B26] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ml-1">{activeFilterCount}</span>
            )}
          </button>
          <BarraBusqueda valor={busqueda} onChange={setBusqueda} />
        </div>
      </div>

      {/* Modal de Filtros (Centro de la pantalla) */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFiltersModal(false)} />
          <div className="relative w-full max-w-md max-h-[85vh] bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto z-10 border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">FILTROS</h3>
              <button type="button" aria-label="Cerrar filtros" onClick={() => setShowFiltersModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <PanelFiltros filtros={filtros} onChange={setFiltros} />
          </div>
        </div>
      )}

      {/* Grilla principal */}
      <main className="flex-1 w-full">
        <div className="mb-4 flex items-center justify-between text-sm text-[#003B4F] bg-white/90 backdrop-blur px-4 py-2.5 rounded-xl border border-orange-200/50 shadow-sm font-medium">
          <p>Mostrando <span className="font-extrabold text-[#003B4F]">{totalItems}</span> estudiantes</p>
          {isPending && (
            <span className="text-[#F34B26] text-xs font-bold animate-pulse flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Actualizando...
            </span>
          )}
        </div>
        
        <div className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
          <GrillaEstudiantes estudiantes={estudiantes} />
        </div>

        {totalItems > 0 && (
          <Paginacion 
            paginaActual={paginaActual} 
            totalPaginas={totalPaginas} 
            onChange={setPaginaActual} 
          />
        )}
      </main>
    </div>
  );
}
