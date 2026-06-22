'use client';

import { useState, useEffect, useTransition } from 'react';
import { Loader2, Check, X, Ban, AlertCircle, RotateCcw, Archive, SlidersHorizontal, ClipboardList } from 'lucide-react';
import { listarVacantesConFiltrosRF10, actualizarEstadoVacanteAdminRF10, RF10Vacante } from '@/actions/rf10-vacantes-octavio';
import { RF10Filters, RF10FiltrosState } from './rf10-filters-octavio';

interface RF10VacantesTableProps {
  initialVacantes: RF10Vacante[];
}

// =============================================================================
// COMPONENTE: RF10VacantesTable
// Descripción: Panel de administración principal para el listado, filtrado dinámico
//              y gestión de publicaciones creadas por exalumnos.
//              Cumple los criterios de RF-10 y está estilizado con Tailwind CSS.
// =============================================================================
export function RF10VacantesTable({ initialVacantes }: RF10VacantesTableProps) {
  const [vacantes, setMatchesList] = useState<RF10Vacante[]>(initialVacantes);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Estado local para los filtros interactivos
  const [filtros, setFiltros] = useState<RF10FiltrosState>({
    search: '',
    tipo: 'all',
    carrera: 'all',
    modalidad: 'all',
    estado: 'all',
  });

  // Efecto secundario que detecta cambios en filtros y consulta a Supabase con un pequeño debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      setErrorMsg(null);
      
      startTransition(async () => {
        try {
          const data = await listarVacantesConFiltrosRF10({
            search: filtros.search,
            tipo: filtros.tipo,
            carrera: filtros.carrera,
            modalidad: filtros.modalidad,
            estado: filtros.estado,
          });
          setMatchesList(data);
        } catch (err: any) {
          setErrorMsg(err.message || 'Ocurrió un error al cargar las publicaciones.');
        } finally {
          setLoading(false);
        }
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filtros]);

  const handleFilterChange = (nuevosFiltros: Partial<RF10FiltrosState>) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }));
  };

  const handleClearFilters = () => {
    setFiltros({
      search: '',
      tipo: 'all',
      carrera: 'all',
      modalidad: 'all',
      estado: 'all',
    });
  };

  // Callback de gestión de acciones: Aprobar, Rechazar, Pausar, Reactivar, Cubierta
  const handleAction = async (
    id: string,
    accion: 'aprobar' | 'rechazar' | 'desactivar' | 'reactivar' | 'cubierta'
  ) => {
    setActionLoadingId(id);
    setErrorMsg(null);

    let nuevoEstado: 'activa' | 'cerrada' | 'pausada' | 'cubierta';
    if (accion === 'aprobar' || accion === 'reactivar') {
      nuevoEstado = 'activa';
    } else if (accion === 'rechazar') {
      nuevoEstado = 'cerrada';
    } else if (accion === 'cubierta') {
      nuevoEstado = 'cubierta';
    } else {
      nuevoEstado = 'pausada'; // Desactivación temporal
    }

    try {
      await actualizarEstadoVacanteAdminRF10(id, nuevoEstado);

      // Actualizar de forma reactiva y optimista en el estado local de la tabla
      setMatchesList((prev) =>
        prev.map((v) => (v.id === id ? { ...v, estado: nuevoEstado } : v))
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo actualizar el estado de la publicación.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getModalidadLabel = (modalidad: string) => {
    const map: Record<string, string> = {
      presencial: 'Presencial',
      remoto: 'Remoto',
      hibrido: 'Híbrida',
    };
    return map[modalidad] || modalidad || 'No especificada';
  };

  const getStatusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      activa: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      pausada: 'bg-amber-50 text-amber-700 border-amber-200/70',
      cerrada: 'bg-red-50 text-red-700 border-red-200/70',
      cubierta: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      activa: 'Aprobada / Activa',
      pausada: 'Pausada / Inactiva',
      cerrada: 'Rechazada / Cerrada',
      cubierta: 'Cubierta',
    };
    return map[status] || status;
  };

  return (
    <div className="w-full flex flex-col gap-0">

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECCIÓN 1: FILTROS                                          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filtros</span>
        <div className="flex-1 h-px bg-slate-200 ml-1" />
      </div>

      <RF10Filters
        filtros={filtros}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Banner de error */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECCIÓN 2: GESTIÓN DE PUBLICACIONES                        */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gestión de publicaciones</span>
        <div className="flex-1 h-px bg-slate-200 ml-1" />
      </div>

      {/* Indicadores superiores */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm font-medium text-slate-500">
          Se encontraron <span className="font-bold text-slate-800">{vacantes.length}</span> vacantes publicadas
        </span>
        {(loading || isPending) && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Actualizando datos...</span>
          </div>
        )}
      </div>

      {/* Tabla con estados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {vacantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-center mb-3 text-slate-400">
              <AlertCircle size={22} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-0.5">No se encontraron resultados</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-normal">
              No hay publicaciones de exalumnos que cumplan con la configuración de filtros activa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Publicación</th>
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contacto Exalumno</th>
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Carrera</th>
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tipo y Modalidad</th>
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vacantes.map((vacante) => (
                  <tr key={vacante.id} className="hover:bg-slate-50/30 transition-colors">
                    
                    {/* Título de la vacante */}
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800 text-sm leading-tight">
                          {vacante.titulo}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {vacante.empresa} {vacante.lugar ? `· ${vacante.lugar}` : ''}
                        </span>
                      </div>
                    </td>

                    {/* Exalumno responsable */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {vacante.exalumno?.nombre?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-700 leading-tight">
                            {vacante.exalumno?.nombre || 'Desconocido'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {vacante.exalumno?.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Carrera si existe */}
                    <td className="p-4">
                      {vacante.carrera ? (
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {vacante.carrera}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-300 italic">No especificada</span>
                      )}
                    </td>

                    {/* Tipo y Modalidad */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          vacante.tipo === 'empleo'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-violet-50 text-violet-700 border border-violet-100'
                        }`}>
                          {vacante.tipo === 'empleo' ? 'Empleo' : 'Pasantía'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {getModalidadLabel(vacante.modalidad)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Publicado: {new Date(vacante.created_at).toLocaleDateString('es-CR')}
                      </span>
                    </td>

                    {/* Estado de la vacante */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(vacante.estado)}`}>
                        {getStatusLabel(vacante.estado)}
                      </span>
                    </td>

                    {/* Acciones principales de administración */}
                    <td className="p-4 text-right">
                      {actionLoadingId === vacante.id ? (
                        <div className="inline-flex items-center justify-end w-28">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          
                          {/* Aprobar: solo si no está activa */}
                          {vacante.estado !== 'activa' && vacante.estado !== 'cerrada' && vacante.estado !== 'cubierta' && (
                            <button
                              type="button"
                              onClick={() => handleAction(vacante.id, 'aprobar')}
                              className="p-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-all"
                              title="Aprobar vacante (activar)"
                            >
                              <Check size={14} />
                            </button>
                          )}

                          {/* Reactivar: solo si está cerrada o cubierta */}
                          {(vacante.estado === 'cerrada' || vacante.estado === 'cubierta') && (
                            <button
                              type="button"
                              onClick={() => handleAction(vacante.id, 'reactivar')}
                              className="p-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-all"
                              title="Reactivar vacante"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}

                          {/* Rechazar: solo si no está cerrada */}
                          {vacante.estado !== 'cerrada' && (
                            <button
                              type="button"
                              onClick={() => handleAction(vacante.id, 'rechazar')}
                              className="p-1 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                              title="Rechazar / Cerrar vacante"
                            >
                              <X size={14} />
                            </button>
                          )}

                          {/* Pausar: solo si no está pausada ni cerrada */}
                          {vacante.estado !== 'pausada' && vacante.estado !== 'cerrada' && (
                            <button
                              type="button"
                              onClick={() => handleAction(vacante.id, 'desactivar')}
                              className="p-1 rounded bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition-all"
                              title="Pausar / Desactivar vacante"
                            >
                              <Ban size={14} />
                            </button>
                          )}

                          {/* Marcar cubierta: solo si está activa o pausada */}
                          {(vacante.estado === 'activa' || vacante.estado === 'pausada') && (
                            <button
                              type="button"
                              onClick={() => handleAction(vacante.id, 'cubierta')}
                              className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
                              title="Marcar como cubierta"
                            >
                              <Archive size={14} />
                            </button>
                          )}

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

    </div>
  );
}
