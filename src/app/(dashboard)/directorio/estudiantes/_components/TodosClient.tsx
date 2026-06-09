"use client";

import React, { useState, useEffect, useRef } from "react";
import PanelFiltros from "./PanelFiltros";
import GrillaEstudiantes from "./GrillaEstudiantes";
import BarraBusqueda from "./BarraBusqueda";
import PaginacionMock from "./PaginacionMock";
import { FiltrosDirectorio, EstudianteDirectorio } from "@/types/estudiantes";
import { getEstudiantes } from "@/lib/api";
import { buildQueryString } from "@/lib/url-utils";

const ITEMS_POR_PAGINA = 6;

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

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-esmeralda mb-1">Todos los Estudiantes</h1>
          <p className="text-sm text-slate-500">Explora el directorio completo de proyectos.</p>
        </div>
        <div className="w-full sm:w-auto">
          <BarraBusqueda valor={busqueda} onChange={setBusqueda} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Panel Lateral */}
        <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
          <PanelFiltros filtros={filtros} onChange={setFiltros} />
        </aside>

        {/* Grilla principal */}
        <main className="flex-1 w-full">
          <div className="mb-4 flex items-center justify-between text-sm text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80">
            <p>Mostrando <span className="font-bold text-slate-700">{totalItems}</span> estudiantes</p>
            {isPending && (
              <span className="text-esmeralda text-xs font-semibold animate-pulse flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Actualizando...
              </span>
            )}
          </div>
          
          <div className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
            <GrillaEstudiantes estudiantes={estudiantes} />
          </div>

          {totalItems > 0 && (
            <PaginacionMock 
              paginaActual={paginaActual} 
              totalPaginas={totalPaginas} 
              onChange={setPaginaActual} 
            />
          )}
        </main>
      </div>
    </>
  );
}
