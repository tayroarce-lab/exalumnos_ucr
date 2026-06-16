"use client";

import React, { useState, useEffect, useRef } from "react";
import PanelFiltros from "./PanelFiltros";
import GrillaEstudiantes from "./GrillaEstudiantes";
import PaginacionMock from "./PaginacionMock";
import { FiltrosDirectorio, EstudianteDirectorio } from "@/types/estudiantes";
import { getEstudiantes } from "@/lib/api";
import { buildQueryString } from "@/lib/url-utils";

interface DirectorioClientProps {
  estudiantesIniciales: EstudianteDirectorio[];
  totalInicial: number;
  filtrosIniciales: FiltrosDirectorio;
  paginaInicial: number;
}

export default function DirectorioClient({ 
  estudiantesIniciales, 
  totalInicial,
  filtrosIniciales,
  paginaInicial
}: DirectorioClientProps) {
  const [filtros, setFiltros] = useState<FiltrosDirectorio>(filtrosIniciales);
  const [pagina, setPagina] = useState(paginaInicial || 1);

  const [estudiantes, setEstudiantes] = useState<EstudianteDirectorio[]>(estudiantesIniciales);
  const [totalItems, setTotalItems] = useState(totalInicial);
  const [isPending, setIsPending] = useState(false);
  
  const isFirstRender = useRef(true);

  // Manejar cambio de filtros (resetea a página 1)
  const handleFiltrosChange = (nuevosFiltros: FiltrosDirectorio) => {
    setFiltros(nuevosFiltros);
    setPagina(1);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(async () => {
      setIsPending(true);

      // Actualizar URL silenciosamente sin recargar Server Component
      const newUrl = `${window.location.pathname}${buildQueryString(filtros, "", pagina)}`;
      window.history.replaceState(null, '', newUrl);

      try {
        const { estudiantes: data, total } = await getEstudiantes(filtros, {
          page: pagina,
          limit: 12
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
  }, [filtros, pagina]);

  const totalPaginas = Math.ceil(totalItems / 12);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Panel Lateral */}
      <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
        <PanelFiltros filtros={filtros} onChange={handleFiltrosChange} />
      </aside>

      {/* Grilla principal */}
      <main className="flex-1 w-full">
        <div className="mb-4 flex items-center justify-between text-sm text-[#003B4F] bg-white/90 backdrop-blur px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-sm font-medium">
          <p>Mostrando <span className="font-extrabold text-[#003B4F]">{totalItems}</span> estudiantes</p>
          {isPending && (
            <span className="text-[#54BCEB] text-xs font-bold animate-pulse flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Actualizando...
            </span>
          )}
        </div>
        
        <div className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
          <GrillaEstudiantes estudiantes={estudiantes} />
        </div>

        {/* Paginación */}
        <PaginacionMock 
          paginaActual={pagina} 
          totalPaginas={totalPaginas} 
          onChange={setPagina} 
        />
      </main>
    </div>
  );
}

