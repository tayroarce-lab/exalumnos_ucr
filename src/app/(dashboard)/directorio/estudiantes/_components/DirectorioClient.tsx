"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SlidersHorizontal, X, Search } from "lucide-react";
import PanelFiltros from "./PanelFiltros";
import GrillaEstudiantes from "./GrillaEstudiantes";
import Paginacion from "./Paginacion";
import { FiltrosDirectorio, EstudianteDirectorio } from "@/types/estudiantes";
import { getEstudiantes } from "@/lib/api";
import { buildQueryString } from "@/lib/url-utils";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface DirectorioClientProps {
  estudiantesIniciales: EstudianteDirectorio[];
  totalInicial: number;
  filtrosIniciales: FiltrosDirectorio;
  paginaInicial: number;
  busquedaInicial: string;
}

export default function DirectorioClient({ 
  estudiantesIniciales, 
  totalInicial,
  filtrosIniciales,
  paginaInicial,
  busquedaInicial
}: DirectorioClientProps) {
  const [filtros, setFiltros] = useState<FiltrosDirectorio>(filtrosIniciales);
  const [pagina, setPagina] = useState(paginaInicial || 1);
  const [busqueda, setBusqueda] = useState(busquedaInicial || "");
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useLockBodyScroll(showFiltersModal);

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
      const newUrl = `${window.location.pathname}${buildQueryString(filtros, busqueda, pagina)}`;
      window.history.replaceState(null, '', newUrl);

      try {
        const { estudiantes: data, total } = await getEstudiantes(filtros, {
          busqueda,
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
  }, [filtros, pagina, busqueda]);

  const totalPaginas = Math.ceil(totalItems / 12);
  const activeFilterCount = (filtros.carrera.length) + (filtros.proyecto_area_tematica.length) + (filtros.tipos_apoyo.length) + (filtros.proyecto_tipo ? 1 : 0) + (filtros.sede ? 1 : 0);

  return (
    <div className="w-full flex flex-col">
      {/* Encabezado con Botón de Filtro al extremo derecho */}
      <div className="pt-2 pb-6 flex items-center justify-between border-b border-white/20 mb-8 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase font-display text-white tracking-wide drop-shadow-sm">Directorio de Estudiantes</h1>
          <p className="text-xs sm:text-sm text-slate-100 font-medium">Encuentra proyectos innovadores que necesitan tu apoyo.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFiltersModal(true)}
            className="h-11 px-5 flex items-center justify-center gap-2 bg-[#003B4F] hover:bg-[#002735] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap self-start md:self-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#F34B26] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ml-1">{activeFilterCount}</span>
            )}
          </button>
          <div className="hidden sm:block">
            <Link 
              href="/directorio/estudiantes/todos"
              className="text-sm font-bold text-white hover:text-[#54BCEB] transition-colors duration-200 flex items-center gap-1 bg-white/10 border border-white/20 px-4 py-2.5 rounded-xl shadow-sm hover:shadow hover:bg-white/20 h-11"
            >
              Ver todos
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Buscador a Ancho Completo */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200" />
        <input
          type="text"
          placeholder="Buscar por nombre, apellidos o proyecto..."
          value={busqueda}
          onChange={e => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
          className="w-full h-12 pl-11 pr-4 bg-[#003B4F]/40 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all placeholder:text-slate-200 shadow-sm"
        />
      </div>

      {/* Pestañas Rápidas de Filtrado */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1 scrollbar-thin shrink-0">
        <button
          onClick={() => {
            setFiltros({
              carrera: [],
              proyecto_area_tematica: [],
              areas_de_interes: [],
              tipos_apoyo: [],
              proyecto_tipo: "",
              sede: "",
            });
            setPagina(1);
          }}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
            filtros.tipos_apoyo.length === 0
              ? "bg-[#003B4F] text-white hover:bg-[#002735]"
              : "bg-white/95 border border-white/20 text-slate-800 hover:bg-white"
          }`}
        >
          🔍 Todos los Estudiantes
        </button>
        <button
          onClick={() => {
            setFiltros({
              carrera: [],
              proyecto_area_tematica: [],
              areas_de_interes: [],
              tipos_apoyo: ["financiamiento", "mentoría", "empleo", "pasantía"],
              proyecto_tipo: "",
              sede: "",
            });
            setPagina(1);
          }}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
            filtros.tipos_apoyo.length > 0
              ? "bg-[#003B4F] text-white hover:bg-[#002735]"
              : "bg-white/95 border border-white/20 text-slate-800 hover:bg-white"
          }`}
        >
          💡 Proyectos Buscando Apoyo (Cualquier Tipo)
        </button>
      </div>

      {/* Modal de Filtros (Centro de la pantalla) */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowFiltersModal(false)} />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">FILTROS</h3>
                <button type="button" aria-label="Cerrar filtros" onClick={() => setShowFiltersModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <PanelFiltros filtros={filtros} onChange={handleFiltrosChange} />
            </div>
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

        {/* Paginación */}
        <Paginacion 
          paginaActual={pagina} 
          totalPaginas={totalPaginas} 
          onChange={setPagina} 
        />
      </main>
    </div>
  );
}

