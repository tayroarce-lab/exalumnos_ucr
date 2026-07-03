'use client';

// =============================================================================
// VISTA PRINCIPAL: DirectorioEstudiantes
// Descripción : Vista pública de proyectos estudiantiles UCR con barra de
//               filtros dinámicos y cuadrícula de tarjetas. Implementada
//               con estado React puro, eventos nativos y Tailwind CSS.
//               Prohibido: <form>, style={{}}, datos socioeconómicos.
// =============================================================================

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Users } from 'lucide-react';
import { TarjetaEstudiante, type EstudiantePublico } from './StudentCard';
import { AREAS_INTERES } from '@/constants/interestAreas';
import { SEDES_UCR } from '@/constants/ucrAcademicData';

// ─── CATÁLOGOS LOCALES ──────────────────────────────────────────────────────

const CARRERAS_UCR = [
  'Ingeniería Informática', 'Ingeniería Industrial', 'Medicina',
  'Derecho', 'Psicología', 'Arquitectura', 'Biología',
  'Administración de Negocios', 'Comunicación Colectiva', 'Trabajo Social',
];

const TIPOS_PROYECTO = [
  'Perfil' // Since we map it as 'Perfil' currently
];

const TIPOS_APOYO = [
  'Mentoría profesional',
  'Empleo',
  'Pasantía'
];

// ─── ESTADO DE FILTROS ───────────────────────────────────────────────────────

interface EstadoFiltros {
  busqueda: string;
  carreras: string[];
  areasTematicas: string[];
  areasInteres: string[];
  tiposApoyo: string[];
  tipoProyecto: string;
  sede: string;
}

const FILTROS_VACIOS: EstadoFiltros = {
  busqueda: '', carreras: [], areasTematicas: [],
  areasInteres: [], tiposApoyo: [], tipoProyecto: '', sede: '',
};

// ─── SUB-COMPONENTE: SelectorMultiple ────────────────────────────────────────

interface PropsSelectorMultiple {
  id: string;
  etiqueta: string;
  opciones: string[];
  seleccionados: string[];
  alCambiar: (valor: string) => void;
}

// [VERDE - FUNCION: SelectorMultiple]
// Dropdown multi-select accesible sin <form>. Gestiona su propio estado de apertura.
function SelectorMultiple({ id, etiqueta, opciones, seleccionados, alCambiar }: PropsSelectorMultiple) {
  const [abierto, setAbierto] = useState(false);
  const refContenedor = useRef<HTMLDivElement>(null);

  // Cierra el dropdown al hacer clic fuera del componente
  useEffect(() => {
    function manejarClicFuera(e: MouseEvent) {
      if (refContenedor.current && !refContenedor.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', manejarClicFuera);
    return () => document.removeEventListener('mousedown', manejarClicFuera);
  }, []);

  const etiquetaBoton = seleccionados.length === 0
    ? etiqueta
    : `${etiqueta} (${seleccionados.length})`;

  return (
    <div ref={refContenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto(prev => !prev)}
        className={`flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg text-sm border transition-all duration-200 ${
          seleccionados.length > 0
            ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
        }`}
      >
        <span className="truncate">{etiquetaBoton}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/30 overflow-hidden">
          <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
            {opciones.map(opcion => {
              const marcado = seleccionados.includes(opcion);
              return (
                <label
                  key={opcion}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors duration-150 ${
                    marcado ? 'bg-blue-600/20 text-blue-300' : 'text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => alCambiar(opcion)}
                    className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-700 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-xs leading-tight">{opcion}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

// [VERDE - FUNCION: DirectorioEstudiantes]
// Vista principal del directorio público de proyectos estudiantiles UCR.
// Incluye filtros dinámicos y cuadrícula de tarjetas con guardrail de privacidad.
import { listarEstudiantes } from '@/actions/students';

export default function DirectorioEstudiantes() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [filtros, setFiltros] = useState<EstadoFiltros>(FILTROS_VACIOS);
  const [estudiantes, setEstudiantes] = useState<EstudiantePublico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false); // Nuevo estado para móviles

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          const { data: dbUser } = await supabase.from('users').select('rol').eq('id', user.id).single()
          setIsAdmin(dbUser?.rol === 'admin' || user.user_metadata?.rol === 'admin')
        }
      })
    })

    async function cargarEstudiantes() {
      try {
        const { data } = await listarEstudiantes();
        if (data) {
          const mapped: EstudiantePublico[] = data.map((u: any) => {
            const carreraInfo = u.users_carreras?.[0]?.carrera_campus;
            const curriculum = u.curriculums?.[0];
            
            const apoyos = [];
            if (u.busca_mentoria) apoyos.push('Mentoría profesional');
            if (u.busca_empleo) apoyos.push('Empleo');

            return {
              id: u.id,
              nombreCompleto: `${u.nombre} ${u.apellidos || ''}`.trim() || 'Sin Nombre',
              carrera: carreraInfo?.carreras?.nombre || 'Carrera no especificada',
              sede: carreraInfo?.campus?.nombre || 'Sede no especificada',
              fotoPerfil: undefined, // Add if available
              proyecto: {
                titulo: curriculum?.sobre_mi || 'Perfil Estudiantil',
                areaTematica: 'General',
                tipoProyecto: 'Perfil',
                porcentajeAvance: 100
              },
              areasInteres: u.areas_de_interes || [],
              tiposApoyoBuscado: apoyos
            };
          });
          setEstudiantes(mapped);
        }
      } catch (err) {
        console.error("Error al cargar estudiantes:", err);
      } finally {
        setCargando(false);
      }
    }
    cargarEstudiantes();
  }, []);

  // [VERDE - FUNCION: manejarCambioFiltroMultiple]
  // Agrega o elimina un valor de un filtro de selección múltiple (toggle).
  function manejarCambioFiltroMultiple(
    campo: 'carreras' | 'areasTematicas' | 'areasInteres' | 'tiposApoyo',
    valor: string
  ) {
    setFiltros(prev => ({
      ...prev,
      [campo]: prev[campo].includes(valor)
        ? prev[campo].filter(v => v !== valor)
        : [...prev[campo], valor],
    }));
  }

  // [VERDE - FUNCION: manejarCambioFiltroSimple]
  // Actualiza un filtro de valor único (select simple o texto de búsqueda).
  function manejarCambioFiltroSimple(
    campo: 'tipoProyecto' | 'sede' | 'busqueda',
    valor: string
  ) {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }

  // [VERDE - FUNCION: limpiarFiltros]
  // Restablece todos los filtros a su estado vacío inicial.
  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS);
  }

  // Comprueba si hay algún filtro activo para mostrar el botón de limpieza
  const hayFiltrosActivos =
    filtros.busqueda !== '' ||
    filtros.carreras.length > 0 ||
    filtros.areasTematicas.length > 0 ||
    filtros.areasInteres.length > 0 ||
    filtros.tiposApoyo.length > 0 ||
    filtros.tipoProyecto !== '' ||
    filtros.sede !== '';

  // [VERDE - FUNCION: estudiantesFiltrados]
  // Aplica todos los filtros activos sobre el catálogo de datos mock.
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(est => {
      // Filtro por búsqueda de texto libre (nombre o título de proyecto)
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        if (
          !est.nombreCompleto.toLowerCase().includes(q) &&
          !est.proyecto.titulo.toLowerCase().includes(q)
        ) return false;
      }
      // Filtro por carrera
      if (filtros.carreras.length > 0 && !filtros.carreras.includes(est.carrera)) return false;
      // Filtro por área temática del proyecto
      if (filtros.areasTematicas.length > 0 && !filtros.areasTematicas.includes(est.proyecto.areaTematica)) return false;
      // Filtro por áreas de interés del estudiante (al menos una coincidencia)
      if (filtros.areasInteres.length > 0 && !filtros.areasInteres.some(a => est.areasInteres.includes(a))) return false;
      // Filtro por tipo de apoyo buscado (al menos una coincidencia)
      if (filtros.tiposApoyo.length > 0 && !filtros.tiposApoyo.some(t => est.tiposApoyoBuscado.includes(t))) return false;
      // Filtro por tipo de proyecto (selector simple)
      if (filtros.tipoProyecto && est.proyecto.tipoProyecto !== filtros.tipoProyecto) return false;
      // Filtro por sede UCR (selector simple)
      if (filtros.sede && est.sede !== filtros.sede) return false;
      return true;
    });
  }, [filtros, estudiantes]);

  // [VERDE - FUNCION: ejecutarOfrecerApoyo]
  // Manejador del botón "Ofrecer apoyo" de cada tarjeta de estudiante.
  function ejecutarOfrecerApoyo(idEstudiante: string) {
    const estudiante = estudiantes.find(e => e.id === idEstudiante);
    if (!estudiante) return;
    // TODO: Conectar con el flujo de match / notificación al estudiante
    alert(`¡Oferta de apoyo enviada a ${estudiante.nombreCompleto}!`);
  }

  // Catálogo de áreas temáticas derivado de las áreas de interés generales
  const AREAS_TEMATICAS = AREAS_INTERES.map(a => a.nombre);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── ENCABEZADO ── */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Directorio de Proyectos</h1>
              <p className="text-slate-500 text-xs">Fundación Exalumnos UCR</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">
              <span className="text-white font-semibold">{estudiantesFiltrados.length}</span> proyecto{estudiantesFiltrados.length !== 1 ? 's' : ''} encontrado{estudiantesFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── BARRA DE BÚSQUEDA RÁPIDA ── */}
        <div className="flex flex-col sm:flex-row gap-3 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="input-busqueda-directorio"
              type="text"
              placeholder="Buscar por nombre o título de proyecto..."
              value={filtros.busqueda}
              onChange={e => manejarCambioFiltroSimple('busqueda', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 transition-all duration-200 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center justify-center gap-2 sm:hidden px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              mostrarFiltros || hayFiltrosActivos 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800 border border-slate-700 text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros {hayFiltrosActivos && '(Activos)'}</span>
            {mostrarFiltros ? <ChevronDown className="w-4 h-4 rotate-180 transition-transform" /> : <ChevronDown className="w-4 h-4 transition-transform" />}
          </button>
        </div>

        {/* ── PANEL DE FILTROS ── */}
        <div className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:block ${mostrarFiltros ? 'block' : 'hidden'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
              <span className="text-sm font-medium text-slate-300 hidden sm:block">Filtros Avanzados</span>
              {hayFiltrosActivos && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  {[
                    filtros.carreras.length,
                    filtros.areasTematicas.length,
                    filtros.areasInteres.length,
                    filtros.tiposApoyo.length,
                    filtros.tipoProyecto ? 1 : 0,
                    filtros.sede ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)} activos
                </span>
              )}
            </div>
            {hayFiltrosActivos && (
              <button
                type="button"
                id="btn-limpiar-filtros"
                onClick={limpiarFiltros}
                className="flex items-center justify-center w-full sm:w-auto gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 sm:bg-transparent text-slate-300 sm:text-slate-400 sm:hover:text-white px-3 py-2 sm:p-0 rounded-lg transition-colors duration-150"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Fila 1: Selectores múltiples */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <SelectorMultiple
              id="carrera"
              etiqueta="Carrera"
              opciones={CARRERAS_UCR}
              seleccionados={filtros.carreras}
              alCambiar={v => manejarCambioFiltroMultiple('carreras', v)}
            />
            <SelectorMultiple
              id="area-tematica"
              etiqueta="Área temática del proyecto"
              opciones={AREAS_TEMATICAS}
              seleccionados={filtros.areasTematicas}
              alCambiar={v => manejarCambioFiltroMultiple('areasTematicas', v)}
            />
            <SelectorMultiple
              id="area-interes"
              etiqueta="Áreas de interés"
              opciones={AREAS_TEMATICAS}
              seleccionados={filtros.areasInteres}
              alCambiar={v => manejarCambioFiltroMultiple('areasInteres', v)}
            />
          </div>

          {/* Fila 2: Selectores simples */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <select
              id="select-tipo-proyecto"
              title="Tipo de proyecto"
              aria-label="Tipo de proyecto"
              value={filtros.tipoProyecto}
              onChange={e => manejarCambioFiltroSimple('tipoProyecto', e.target.value)}
              className="px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-400 focus:outline-none focus:border-blue-500/70 transition-all duration-200 cursor-pointer"
            >
              <option value="">Tipo de proyecto (todos)</option>
              {TIPOS_PROYECTO.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              id="select-sede-ucr"
              title="Sede UCR"
              aria-label="Sede UCR"
              value={filtros.sede}
              onChange={e => manejarCambioFiltroSimple('sede', e.target.value)}
              className="px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-400 focus:outline-none focus:border-blue-500/70 transition-all duration-200 cursor-pointer"
            >
              <option value="">Sede UCR (todas)</option>
              {SEDES_UCR.map(s => (
                <option key={s.id} value={s.nombreCorto}>{s.nombreCorto}</option>
              ))}
            </select>
          </div>

          {/* Fila 3: Checkboxes de tipo de apoyo buscado */}
          <div>
            <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Tipo de apoyo buscado</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {TIPOS_APOYO.map(tipo => {
                const activo = filtros.tiposApoyo.includes(tipo);
                return (
                  <label
                    key={tipo}
                    className="flex items-center gap-2 cursor-pointer group/check"
                  >
                    <input
                      type="checkbox"
                      id={`chk-apoyo-${tipo.replace(/\s+/g, '-').toLowerCase()}`}
                      checked={activo}
                      onChange={() => manejarCambioFiltroMultiple('tiposApoyo', tipo)}
                      className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-700 accent-emerald-500 cursor-pointer"
                    />
                    <span className={`text-xs transition-colors duration-150 ${activo ? 'text-emerald-400 font-medium' : 'text-slate-400 group-hover/check:text-slate-300'}`}>
                      {tipo}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CUADRÍCULA DE TARJETAS ── */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Cargando directorio...</p>
          </div>
        ) : estudiantesFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {estudiantesFiltrados.map(est => (
              <TarjetaEstudiante
                key={est.id}
                estudiante={est}
                isAdmin={isAdmin}
                alOfrecerApoyo={ejecutarOfrecerApoyo}
              />
            ))}
          </div>
        ) : (
          /* Estado vacío cuando no hay resultados */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-900/40 border border-slate-800/60 rounded-3xl mt-4">
            <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-lg shadow-black/20">
              <Search className="w-10 h-10 text-blue-500/80" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-xl font-bold text-white mb-2">Sin resultados</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                No pudimos encontrar ningún proyecto o estudiante que coincida exactamente con los filtros aplicados. Intenta ampliar tu búsqueda o remover algunos filtros.
              </p>
            </div>
            <button
              type="button"
              id="btn-limpiar-filtros-vacio"
              onClick={limpiarFiltros}
              className="px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-sm font-medium rounded-xl border border-blue-500/20 transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
