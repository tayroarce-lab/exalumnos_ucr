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

// ============================================================
// TARJETA DE EXALUMNO
// ============================================================
function ExalumnoCard({ ex }: { ex: ExalumnoPublic }) {
  const apoyos = APOYO_FILTROS.filter(a => ex[a.key as keyof ExalumnoPublic])
  
  return (
    <Card hoverEffect={true} className="bg-white border border-slate-200 border-t-4 border-t-[#F34B26] rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        {ex.foto_url ? (
          <img src={getAvatarUrl(ex.foto_url) as string} alt={`Foto de ${ex.nombre} ${ex.apellidos || ''}`} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
        ) : (
          <div className={`w-14 h-14 rounded-xl ${ex.avatarBg} text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm`} aria-label={`Iniciales de ${ex.nombre} ${ex.apellidos || ''}`}>
            {ex.initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-semibold text-[#F34B26] text-base leading-tight">{ex.nombre} {ex.apellidos}</h3>
          <p className="text-xs text-slate-500 mt-1">{ex.carrera_principal || 'Exalumno UCR'}{(ex.anio_graduacion) ? `, ${ex.anio_graduacion}` : ''}</p>
          <p className="text-xs font-bold text-[#FF9B18] mt-0.5">{ex.cargo_actual || 'Profesional'} en {ex.empresa_actual || 'Independiente'}</p>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
             {ex.pais_ciudad && (
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {ex.pais_ciudad}
                </span>
             )}
             {ex.score_match > 0 && (
                <span className="inline-flex bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded items-center gap-1">
                   ⭐ MATCH: {ex.score_match}%
                </span>
             )}
          </div>
        </div>
      </div>

      {/* Áreas de interés */}
      {ex.areas_de_interes && ex.areas_de_interes.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Intereses</p>
          <div className="flex flex-wrap gap-1.5">
            {ex.areas_de_interes.slice(0, 3).map(a => (
              <span key={a} className="bg-orange-50 text-[#F34B26] text-[10px] font-semibold px-2.5 py-1 rounded-full">{a}</span>
            ))}
            {ex.areas_de_interes.length > 3 && (
              <span className="bg-orange-50 text-[#F34B26] text-[10px] font-semibold px-2.5 py-1 rounded-full">+{ex.areas_de_interes.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Tipos de Apoyo */}
      {apoyos.length > 0 && (
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ofrece</p>
          <div className="flex flex-wrap gap-1.5">
            {apoyos.map(a => (
              <span key={a.key} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                <span aria-hidden="true">{a.icon}</span> {a.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botón */}
      <div className="mt-auto pt-4 flex gap-2">
        <Link href={`/network/${ex.id}`} className="flex-1">
          <Button variant="secondary" className="w-full bg-white border-orange-200 text-[#F34B26] hover:bg-orange-50/40 font-medium text-xs py-2">
            Ver Perfil y Conectar
          </Button>
        </Link>
      </div>
    </Card>
  )
}

// ============================================================
// FILTROS SIDEBAR
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

  const inputClassName = "w-full text-sm py-2 px-3 border-[0.5px] border-slate-300 rounded-md appearance-none bg-white focus:outline-none focus:border-[#F34B26] text-slate-800 placeholder-slate-400"
  const selectClassName = "w-full text-sm py-2 pl-3 pr-8 border-[0.5px] border-slate-300 rounded-md appearance-none bg-white focus:outline-none focus:border-[#F34B26] text-slate-800"

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
                 <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${selected.includes(opt.value) ? 'bg-[#F34B26] border-[#F34B26] text-white' : 'border-slate-300 bg-white group-hover:border-[#F34B26]'}`}>
                    {selected.includes(opt.value) && <Check className="w-3 h-3" />}
                 </div>
                 <span className="text-[13px] text-slate-700 leading-tight">{opt.label}</span>
              </label>
           ))}
        </div>
     )
  }

  return (
    <div className="space-y-6 max-w-[280px] w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">FILTROS</h3>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button type="button" onClick={clearAll} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider transition-colors underline">
              Limpiar
            </button>
          )}
          {onClose && (
            <button type="button" aria-label="Cerrar filtros" onClick={() => onClose()} className="p-1 text-slate-400 hover:text-slate-700 lg:hidden">
              <X className="w-4 h-4" />
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
// PÁGINA PRINCIPAL — DIRECTORIO
// ============================================================
export default function NetworkPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '', facultad: '', escuela: '', carreras: [], sectores: [], areas: [], apoyos: [], pais_ciudad: ''
  })
  
  // Debounce para la búsqueda de texto
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(filters)
  
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [exalumnos, setExalumnos] = useState<ExalumnoPublic[]>([])
  const [cargando, setCargando] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 20

  useEffect(() => {
    // Validar sesión del lado del cliente como fallback (middleware hace el groso del trabajo)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = '/login'
      } else if (!user.email_confirmed_at) {
        window.location.href = '/verificar-correo'
      }
    })
  }, [])

  // Efecto para Debounce de la búsqueda y filtros de texto libre
  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo actualiza debounced filters si la búsqueda está vacía o tiene >= 2 caracteres
      if (filters.search.length === 0 || filters.search.length >= 2) {
         setDebouncedFilters(filters)
         setPage(0) // reset page on filter change
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
        offset: currentPage * limit
      })

      if (error) throw new Error(error)

      const mapped: ExalumnoPublic[] = data.map(p => {
        const nombreStr = p.nombre || p.apellidos 
          ? `${p.nombre || ''} ${p.apellidos || ''}`.trim()
          : 'Exalumno UCR'
        
        const init = nombreStr.substring(0, 2).toUpperCase()
        
        return {
          ...p,
          nombre: p.nombre || 'Exalumno',
          initials: init,
          avatarBg: 'bg-[#F34B26]',
        }
      })

      if (currentPage === 0) {
        setExalumnos(mapped)
      } else {
        setExalumnos(prev => [...prev, ...mapped])
      }
      
      setHasMore((currentPage + 1) * limit < total)
      
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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-8 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="pt-2 pb-6 space-y-1">
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">Directorio de Exalumnos</h1>
          <p className="text-sm text-slate-600 font-medium">Conecta con exalumnos de la UCR que ofrecen mentoría, empleo, pasantías y más.</p>
        </div>

        {/* Buscador + Botón Filtros Móvil */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cargo o empresa..."
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#F34B26] focus:ring-2 focus:ring-[#F34B26]/10 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden h-12 px-4 flex items-center gap-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#F34B26] transition-all shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#F34B26] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Sidebar de Filtros (escritorio) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sticky top-4">
              <FilterPanel filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* Panel móvil de filtros */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto">
                <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowMobileFilters(false)} />
              </div>
            </div>
          )}

          {/* Grid de resultados */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider" aria-live="polite">
                {cargando && page === 0 ? 'Buscando...' : `${exalumnos.length} resultados`}
              </p>
            </div>

            {cargando && page === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#F34B26] rounded-full animate-spin mb-4"></div>
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Cargando directorio...</h3>
              </div>
            ) : exalumnos.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  {exalumnos.map((ex, index) => <ExalumnoCard key={`${ex.id}-${index}`} ex={ex} />)}
                </div>
                {hasMore && (
                  <div className="text-center pb-8 mt-auto">
                    <Button 
                      variant="secondary" 
                      onClick={() => setPage(p => p + 1)}
                      disabled={cargando}
                      className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      {cargando ? 'Cargando más...' : 'Cargar más resultados'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm mt-4">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">No se encontraron exalumnos</h3>
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
