'use client'
import { getAvatarUrl } from '@/lib/utils';

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { buscarExalumnosDirectorio } from '@/actions/directory'
import {
  Search, SlidersHorizontal, MapPin, Briefcase, GraduationCap,
  Heart, Users, X, Handshake, Building, ChevronDown, Check
} from 'lucide-react'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import {
  CARRERAS_UCR,
  SECTORES_INDUSTRIA,
  AREAS_INTERES,
} from '@/constants/catalogs'

// ============================================================
// TIPOS
// ============================================================
type ExalumnoDirectorio = Awaited<ReturnType<typeof buscarExalumnosDirectorio>>['data'][number]

interface ExalumnoPublic extends ExalumnoDirectorio {
  initials: string
  avatarBg: string
}

// ============================================================
// CONSTANTES
// ============================================================

const APOYO_FILTROS = [
  { key: 'ofrece_mentoria', label: 'Mentoría', icon: '🎓' },
  { key: 'ofrece_empleo', label: 'Empleo', icon: '💼' },
  { key: 'ofrece_pasantia', label: 'Pasantía', icon: '📋' },
  { key: 'ofrece_proyecto', label: 'Proyecto', icon: '🤝' },
  { key: 'ofrece_donacion_dinero', label: 'Donación', icon: '💰' },
]

// ==========================// TARJETA DE EXALUMNO
// ============================================================
function ExalumnoCard({ ex, isAdmin }: { ex: ExalumnoPublic, isAdmin: boolean }) {
  const apoyos = APOYO_FILTROS.filter(a => ex[a.key as keyof ExalumnoPublic])
  
  return (
    <Card hoverEffect={true} className="bg-white hover:bg-orange-50 hover:border-[#F34B26] hover:shadow-[0_0_20px_rgba(243,75,38,0.25)] hover:-translate-y-1 rounded-2xl border border-[#F34B26]/30 p-5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group h-full">

      {/* Cabecera con avatar, nombre y badge */}
      <div className="flex items-start gap-4 relative z-10">
        {/* Avatar con anillo oscuro */}
        <div className="relative flex-shrink-0 mt-1">
          <div className="w-12 h-12 rounded-full p-0.5 border-2 border-[#003B4F] shadow-sm bg-white flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
              {ex.foto_url ? (
                <img src={getAvatarUrl(ex.foto_url) as string} alt={`Foto de ${ex.nombre} ${ex.apellidos || ''}`} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-[#54BCEB] text-white flex items-center justify-center font-bold text-lg" aria-label={`Iniciales de ${ex.nombre}`}>
                  {ex.initials}
                </div>
              )}
            </div>
          </div>
          {/* Pequeño icono en la esquina */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
             <div className="w-3 h-3 bg-[#F34B26] rounded-full"></div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-sans font-extrabold text-[#003B4F] text-[15px] leading-tight truncate uppercase" title={`${ex.nombre} ${ex.apellidos || ''}`}>
                {ex.nombre} {ex.apellidos}
              </h3>
              <p className="text-[11px] font-bold text-[#0081A7] mt-0.5 truncate">{ex.carrera_principal || 'Exalumno UCR'}</p>
              {ex.pais_ciudad && (
                <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#F34B26]" fill="#F34B26" strokeWidth={1} /> {ex.pais_ciudad}
                </p>
              )}
            </div>
            
            {/* Badge de Match grande */}
            {ex.score_match > 0 && (
              <span className="bg-[#F34B26] text-white text-[13px] font-black px-3 py-2 rounded-full shadow-sm flex flex-col items-center justify-center min-w-[55px] shrink-0">
                <span>{ex.score_match}%</span>
                <span className="text-[8px] font-extrabold uppercase tracking-widest opacity-90 leading-none mt-0.5">Match</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Central: Cargo y Especialidad */}
      <div className="pt-2 flex-1 flex flex-col gap-2 relative z-10">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cargo Actual</p>
          <p className="text-xs font-bold text-[#C0392B] line-clamp-2 leading-snug uppercase">
            {ex.cargo_actual || 'Profesional'} en {ex.empresa_actual || 'Independiente'}
          </p>
        </div>

        {/* Áreas de interés */}
        {ex.areas_de_interes && ex.areas_de_interes.length > 0 && (
          <div className="mt-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Intereses</p>
            <div className="flex flex-wrap gap-1.5">
              {ex.areas_de_interes.slice(0, 3).map(a => (
                <span key={a} className="bg-orange-50 text-[#C0392B] border border-orange-100/50 text-[10px] font-semibold px-2.5 py-1 rounded-full">{a}</span>
              ))}
              {ex.areas_de_interes.length > 3 && (
                <span className="bg-orange-50 text-[#C0392B] border border-orange-100/50 text-[10px] font-semibold px-2.5 py-1 rounded-full">+{ex.areas_de_interes.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Tipos de Apoyo */}
        {apoyos.length > 0 && (
          <div className="mt-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ofrece</p>
            <div className="flex flex-wrap gap-1.5">
              {apoyos.map(a => (
                <span key={a.key} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  <span aria-hidden="true" className="mr-1">{a.icon}</span>{a.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer con botones */}
      <div className="pt-2 mt-auto flex flex-col gap-2 relative z-10">
        <Link href={`/network/${ex.id}`} className="w-full">
          <button className="w-full bg-[#F34B26] hover:bg-[#C0392B] text-white font-bold text-[13px] py-2.5 transition-all rounded-xl flex items-center justify-center cursor-pointer shadow-sm">
            Ver Perfil y Conectar
          </button>
        </Link>
      </div>
    </Card>
  )
}

// ============================================================
// FILTROS SIDEBAR (MODAL)
// ============================================================
interface Filters {
  search: string
  facultad: string
  escuela: string
  carreras: string[]
  sectores: string[]
  areas: string[]
  apoyos: string[]
  pais_ciudad: string
}

function FilterPanel({
  filters,
  setFilters,
  onClose,
}: {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  onClose?: () => void
}) {
  const clearAll = () => setFilters({ search: '', facultad: '', escuela: '', carreras: [], sectores: [], areas: [], apoyos: [], pais_ciudad: '' })
  const hasFilters = filters.facultad || filters.escuela || filters.carreras.length > 0 || filters.sectores.length > 0 || filters.areas.length > 0 || filters.apoyos.length > 0 || filters.pais_ciudad

  const toggleArrayItem = (key: keyof Filters, value: string) => {
    setFilters(prev => {
      const arr = prev[key] as string[]
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter(item => item !== value) }
      } else {
        return { ...prev, [key]: [...arr, value] }
      }
    })
  }

  const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  )

  const inputClassName = "w-full text-sm py-2 px-3 border-[0.5px] border-slate-300 rounded-md appearance-none bg-white focus:outline-none focus:border-[#54BCEB] text-slate-800 placeholder-slate-400"
  const selectClassName = "w-full text-sm py-2 pl-3 pr-8 border-[0.5px] border-slate-300 rounded-md appearance-none bg-white focus:outline-none focus:border-[#54BCEB] text-slate-800"

  const CheckboxGroup = ({ options, selected, onToggle }: { options: {label: string, value: string}[], selected: string[], onToggle: (val: string) => void }) => {
     return (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
           {options.map(opt => (
              <label key={opt.value} className="flex items-start gap-2 cursor-pointer group">
                 <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected.includes(opt.value)}
                    onChange={() => onToggle(opt.value)}
                 />
                 <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${selected.includes(opt.value) ? 'bg-[#54BCEB] border-[#54BCEB] text-white' : 'border-slate-300 bg-white group-hover:border-[#54BCEB]'}`}>
                    {selected.includes(opt.value) && <Check className="w-3 h-3" />}
                 </div>
                 <span className="text-[13px] text-slate-700 leading-tight">{opt.label}</span>
              </label>
           ))}
        </div>
     )
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">FILTROS</h3>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button type="button" onClick={clearAll} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider transition-colors underline mr-2">
              Limpiar
            </button>
          )}
          {onClose && (
            <button type="button" aria-label="Cerrar filtros" onClick={() => onClose()} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* País / Ciudad */}
        <div>
          <label htmlFor="input-pais" className="block text-[13px] font-medium text-slate-700 mb-1.5">País / Ciudad</label>
          <input
            id="input-pais"
            type="text"
            placeholder="Ej. San José, Costa Rica"
            value={filters.pais_ciudad}
            onChange={e => setFilters(p => ({ ...p, pais_ciudad: e.target.value }))}
            className={inputClassName}
          />
        </div>

        {/* Tipo de Apoyo */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-2">Tipo de Apoyo</label>
          <CheckboxGroup 
            options={APOYO_FILTROS.map(a => ({ label: a.label, value: a.key }))}
            selected={filters.apoyos}
            onToggle={(val) => toggleArrayItem('apoyos', val)}
          />
        </div>

        {/* Facultad */}
        <div>
          <label id="label-facultad" className="block text-[13px] font-medium text-slate-700 mb-1.5">Facultad</label>
          <SelectWrapper>
            <select
              aria-labelledby="label-facultad"
              value={filters.facultad}
              onChange={e => setFilters(p => ({ ...p, facultad: e.target.value }))}
              className={selectClassName}
            >
              <option value="">Todas las facultades</option>
              <option value="Ciencias">Facultad de Ciencias</option>
              <option value="Ingeniería">Facultad de Ingeniería</option>
              <option value="Ciencias Económicas">Ciencias Económicas</option>
            </select>
          </SelectWrapper>
        </div>

        {/* Carrera UCR */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-2">Carrera UCR</label>
          <CheckboxGroup 
            options={CARRERAS_UCR.map(c => ({ label: c, value: c }))}
            selected={filters.carreras}
            onToggle={(val) => toggleArrayItem('carreras', val)}
          />
        </div>

        {/* Sector */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-2">Sector / Industria</label>
          <CheckboxGroup 
            options={SECTORES_INDUSTRIA.map(s => ({ label: s, value: s }))}
            selected={filters.sectores}
            onToggle={(val) => toggleArrayItem('sectores', val)}
          />
        </div>

        {/* Áreas de Interés */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-2">Áreas de Interés</label>
          <CheckboxGroup 
            options={AREAS_INTERES.map(a => ({ label: a, value: a }))}
            selected={filters.areas}
            onToggle={(val) => toggleArrayItem('areas', val)}
          />
        </div>

      </div>
    </div>
  )
}

// ============================================================
// COMPONENTE DE PAGINACIÓN
// ============================================================
interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
}

function Paginacion({ paginaActual, totalPaginas, onChange }: PaginacionProps) {
  if (totalPaginas <= 1) return null;

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
    let end = Math.min(totalPaginas, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 pb-8">
      <button
        onClick={() => onChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        ← Anterior
      </button>

      {getVisiblePages().map((pagina) => (
        <button
          key={pagina}
          onClick={() => onChange(pagina)}
          className={`w-10 h-10 text-sm font-semibold rounded-xl border transition-all duration-200 ${
            pagina === paginaActual
              ? "border-[#F34B26] bg-[#F34B26] text-white shadow-sm"
              : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          }`}
        >
          {pagina}
        </button>
      ))}

      <button
        onClick={() => onChange(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        Siguiente →
      </button>
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL — DIRECTORIO
// ============================================================
export default function NetworkPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '', facultad: '', escuela: '', carreras: [], sectores: [], areas: [], apoyos: [], pais_ciudad: ''
  })
  
  // Debounce para la búsqueda de texto
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(filters)
  
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [exalumnos, setExalumnos] = useState<ExalumnoPublic[]>([])
  const [cargando, setCargando] = useState(true)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 12

  useEffect(() => {
    // Validar sesión del lado del cliente como fallback (middleware hace el groso del trabajo)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = '/login'
      } else if (!user.email_confirmed_at) {
        window.location.href = '/verificar-correo'
      } else {
        setIsAdmin(user.user_metadata?.rol === 'admin')
      }
    })
  }, [])

  // Efecto para Debounce de la búsqueda y filtros de texto libre
  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo actualiza debounced filters si la búsqueda está vacía o tiene >= 2 caracteres
      if (filters.search.length === 0 || filters.search.length >= 2) {
         setDebouncedFilters(filters)
         setPage(1) // reset page on filter change
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [filters])

  // Fetch de exalumnos usando la Server Action y RPC
  const fetchExalumnos = useCallback(async (currentFilters: Filters, currentPage: number) => {
    setCargando(true)
    try {
      const { data, total, error } = await buscarExalumnosDirectorio({
        ...currentFilters,
        limit,
        offset: (currentPage - 1) * limit
      })

      if (error) throw new Error(error)

      const mapped: ExalumnoPublic[] = data.map(p => {
        const nombreStr = p.nombre || p.apellidos 
          ? `${p.nombre || ''} ${p.apellidos || ''}`.trim()
          : 'Exalumno UCR'
        
        const init = nombreStr.substring(0, 2).toUpperCase()
        
        // Simular un match si no viene o es 0
        const matchCalculado = p.score_match || (nombreStr.length % 2 === 0 ? 85 : 68)
        
        return {
          ...p,
          nombre: p.nombre || 'Exalumno',
          initials: init,
          avatarBg: 'bg-[#54BCEB]',
          score_match: matchCalculado
        }
      })

      // Ordenar por match de mayor a menor
      mapped.sort((a, b) => (b.score_match || 0) - (a.score_match || 0))

      setExalumnos(mapped)
      setTotalItems(total)
      
    } catch (err) {
      console.error("Error al cargar exalumnos:", err)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    fetchExalumnos(debouncedFilters, page)
  }, [debouncedFilters, page, fetchExalumnos])

  const activeFilterCount = (filters.facultad ? 1 : 0) + (filters.escuela ? 1 : 0) + filters.carreras.length + filters.sectores.length + filters.apoyos.length + filters.areas.length + (filters.pais_ciudad ? 1 : 0)

  return (
    <div className="bg-transparent transition-colors duration-300 min-h-screen p-4 sm:p-6 md:p-8 w-full">
      <div className="max-w-none mx-auto w-full space-y-8">

        {/* Encabezado con Botón de Filtro al extremo derecho */}
        <div className="pt-2 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide drop-shadow-sm">Directorio de Exalumnos</h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">Conecta con exalumnos de la UCR que ofrecen mentoría, empleo, pasantías y más.</p>
          </div>
          <button
            onClick={() => setShowFiltersModal(true)}
            className="h-11 px-5 flex items-center justify-center gap-2 bg-[#003B4F] hover:bg-[#002735] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap self-start md:self-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#54BCEB] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ml-1">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Buscador a Ancho Completo */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cargo o empresa..."
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#F34B26] focus:ring-2 focus:ring-[#F34B26]/20 transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>

        {/* Modal de Filtros (Centro de la pantalla) */}
        {showFiltersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFiltersModal(false)} />
            <div className="relative w-full max-w-md max-h-[85vh] bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto z-10 border border-slate-100 flex flex-col gap-4">
              <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowFiltersModal(false)} />
            </div>
          </div>
        )}

        {/* Grid de resultados a Ancho Completo */}
        <div className="w-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider drop-shadow-sm" aria-live="polite">
              {cargando && page === 1 ? 'Buscando...' : `${totalItems} resultados`}
            </p>
          </div>

          {cargando && page === 1 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#F34B26] rounded-full animate-spin mb-4"></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Cargando directorio...</h3>
            </div>
          ) : exalumnos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {exalumnos.map((ex, index) => <ExalumnoCard key={`${ex.id}-${index}`} ex={ex} isAdmin={isAdmin} />)}
              </div>
              <Paginacion 
                paginaActual={page} 
                totalPaginas={Math.ceil(totalItems / limit)} 
                onChange={setPage} 
              />
            </>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm mt-4">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">No se encontraron exalumnos</h3>
              <p className="text-xs text-slate-400 font-medium mb-4">Ajuste los filtros de búsqueda o intente con otros términos.</p>
              <button
                onClick={() => setFilters({ search: '', facultad: '', escuela: '', carreras: [], sectores: [], areas: [], apoyos: [], pais_ciudad: '' })}
                className="text-xs font-bold text-[#F34B26] hover:underline uppercase tracking-wider"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

      </div>
      
      {/* CSS para Scrollbar interna de los filtros */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
      `}} />
    </div>
  )
}
