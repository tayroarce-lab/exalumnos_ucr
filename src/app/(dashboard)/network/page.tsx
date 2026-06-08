'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, SlidersHorizontal, MapPin, Briefcase, GraduationCap,
  Heart, Users, X, Handshake, Building, ChevronDown
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
interface ExalumnoPublic {
  id: string
  nombre: string
  foto_url?: string
  initials: string
  avatarBg: string
  pais_ciudad: string
  carrera_ucr: string[]
  escuela_facultad: string
  anio_graduacion: number
  empresa_actual: string
  cargo_actual: string
  sector_industria: string[]
  areas_de_interes: string[]
  ofrece_mentoria: boolean
  ofrece_empleo: boolean
  ofrece_pasantia: boolean
  ofrece_proyecto: boolean
  ofrece_donacion_dinero: boolean
}

// ============================================================
// DATOS MOCK — se reemplazarán con query Supabase
// ============================================================
const MOCK_EXALUMNOS: ExalumnoPublic[] = [
  {
    id: '1',
    nombre: 'Ing. Carlos Salazar',
    initials: 'CS',
    avatarBg: 'bg-blue-700',
    pais_ciudad: 'Estados Unidos, Seattle',
    carrera_ucr: ['Ciencias de la Computación e Informática'],
    escuela_facultad: 'Escuela de Ciencias de la Computación e Informática (ECCI)',
    anio_graduacion: 2015,
    empresa_actual: 'Amazon Web Services',
    cargo_actual: 'Staff Engineer',
    sector_industria: ['Tecnología e Informática'],
    areas_de_interes: ['Tecnología e Innovación', 'Emprendimiento'],
    ofrece_mentoria: true,
    ofrece_empleo: true,
    ofrece_pasantia: false,
    ofrece_proyecto: true,
    ofrece_donacion_dinero: false,
  },
  {
    id: '2',
    nombre: 'Lic. Laura Rodríguez',
    initials: 'LR',
    avatarBg: 'bg-indigo-600',
    pais_ciudad: 'Costa Rica, San José',
    carrera_ucr: ['Administración de Negocios'],
    escuela_facultad: 'Escuela de Administración de Negocios',
    anio_graduacion: 2018,
    empresa_actual: 'Fintech Solutions',
    cargo_actual: 'Product Manager',
    sector_industria: ['Finanzas y Banca', 'Tecnología e Informática'],
    areas_de_interes: ['Finanzas y Economía', 'Emprendimiento', 'Tecnología e Innovación'],
    ofrece_mentoria: true,
    ofrece_empleo: false,
    ofrece_pasantia: true,
    ofrece_proyecto: false,
    ofrece_donacion_dinero: true,
  },
  {
    id: '3',
    nombre: 'M.Sc. Esteban Vargas',
    initials: 'EV',
    avatarBg: 'bg-sky-600',
    pais_ciudad: 'Costa Rica, Heredia',
    carrera_ucr: ['Matemáticas', 'Ciencias de la Computación e Informática'],
    escuela_facultad: 'Escuela de Matemáticas',
    anio_graduacion: 2017,
    empresa_actual: 'Intel Corporation',
    cargo_actual: 'Data Scientist Lead',
    sector_industria: ['Tecnología e Informática', 'Manufactura e Industria'],
    areas_de_interes: ['Tecnología e Innovación', 'Investigación Científica'],
    ofrece_mentoria: true,
    ofrece_empleo: true,
    ofrece_pasantia: true,
    ofrece_proyecto: true,
    ofrece_donacion_dinero: false,
  },
  {
    id: '4',
    nombre: 'Dra. Ana Jiménez',
    initials: 'AJ',
    avatarBg: 'bg-rose-600',
    pais_ciudad: 'Costa Rica, San José',
    carrera_ucr: ['Medicina'],
    escuela_facultad: 'Escuela de Medicina',
    anio_graduacion: 2012,
    empresa_actual: 'Hospital San Juan de Dios',
    cargo_actual: 'Médico Especialista',
    sector_industria: ['Salud y Ciencias Médicas'],
    areas_de_interes: ['Salud y Bienestar', 'Educación y Formación', 'Bienestar Social'],
    ofrece_mentoria: true,
    ofrece_empleo: false,
    ofrece_pasantia: true,
    ofrece_proyecto: false,
    ofrece_donacion_dinero: true,
  },
  {
    id: '5',
    nombre: 'Lic. Marcos Ureña',
    initials: 'MU',
    avatarBg: 'bg-emerald-600',
    pais_ciudad: 'Colombia, Bogotá',
    carrera_ucr: ['Economía', 'Derecho'],
    escuela_facultad: 'Escuela de Economía',
    anio_graduacion: 2016,
    empresa_actual: 'Banco Internacional',
    cargo_actual: 'Gerente de Riesgo',
    sector_industria: ['Finanzas y Banca', 'Derecho y Consultoría Legal'],
    areas_de_interes: ['Finanzas y Economía', 'Políticas Públicas', 'Emprendimiento'],
    ofrece_mentoria: true,
    ofrece_empleo: true,
    ofrece_pasantia: false,
    ofrece_proyecto: true,
    ofrece_donacion_dinero: false,
  },
  {
    id: '6',
    nombre: 'Ing. Sofía Castro',
    initials: 'SC',
    avatarBg: 'bg-violet-600',
    pais_ciudad: 'España, Madrid',
    carrera_ucr: ['Ingeniería Civil'],
    escuela_facultad: 'Escuela de Ingeniería Civil',
    anio_graduacion: 2019,
    empresa_actual: 'Ferrovial',
    cargo_actual: 'Ingeniera de Proyectos',
    sector_industria: ['Ingeniería y Construcción'],
    areas_de_interes: ['Ingeniería y Manufactura', 'Ambiente y Sostenibilidad'],
    ofrece_mentoria: false,
    ofrece_empleo: true,
    ofrece_pasantia: true,
    ofrece_proyecto: true,
    ofrece_donacion_dinero: false,
  },
]

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
    <Card hoverEffect={true} className="bg-white border border-slate-200 border-t-4 border-t-institutional rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl ${ex.avatarBg} text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm`}>
          {ex.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-semibold text-institutional text-base leading-tight">{ex.nombre}</h3>
          <p className="text-xs text-slate-500 mt-1">{ex.carrera_ucr[0]}{(ex.anio_graduacion) ? `, ${ex.anio_graduacion}` : ''}</p>
          <p className="text-xs font-bold text-blue-600 mt-0.5">{ex.cargo_actual}</p>
          <div className="mt-2">
            <span className="inline-block bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-max">
              <Briefcase className="w-3 h-3" /> {new Date().getFullYear() - ex.anio_graduacion} AÑOS EXP.
            </span>
          </div>
        </div>
      </div>

      {/* Áreas de interés */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Intereses</p>
        <div className="flex flex-wrap gap-1.5">
          {ex.areas_de_interes.slice(0, 3).map(a => (
            <span key={a} className="bg-soft-green text-institutional text-[10px] font-semibold px-2.5 py-1 rounded-full">{a}</span>
          ))}
          {ex.areas_de_interes.length > 3 && (
            <span className="bg-soft-green text-institutional text-[10px] font-semibold px-2.5 py-1 rounded-full">+{ex.areas_de_interes.length - 3}</span>
          )}
        </div>
      </div>

      {/* Tipos de Apoyo */}
      {apoyos.length > 0 && (
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ofrece</p>
          <div className="flex flex-wrap gap-1.5">
            {apoyos.map(a => (
              <span key={a.key} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                {a.icon} {a.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botón */}
      <div className="mt-auto pt-4 flex gap-2">
        <Button variant="secondary" className="p-2 border-slate-200 hover:bg-slate-50 text-slate-400" aria-label="LinkedIn">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
        </Button>
        <Button variant="secondary" className="p-2 border-slate-200 hover:bg-slate-50 text-slate-400" aria-label="Mail">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </Button>
        <Link href={`/network/${ex.id}`} className="flex-1">
          <Button variant="secondary" className="w-full bg-white border-slate-300 text-institutional hover:bg-slate-50 font-medium text-xs py-2">
            Ver Perfil
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
  carrera: string
  sector: string
  apoyo: string
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
  const clearAll = () => setFilters({ search: '', facultad: '', escuela: '', carrera: '', sector: '', apoyo: '' })
  const hasFilters = filters.facultad || filters.escuela || filters.carrera || filters.sector || filters.apoyo

  const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  )

  const selectClassName = "w-full text-sm py-2 pl-3 pr-8 border-[0.5px] border-slate-300 rounded-md appearance-none bg-white focus:outline-none focus:border-institutional text-slate-800"

  return (
    <div className="space-y-5 max-w-[280px] w-full">
      <div className="flex items-center justify-between mb-2">
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
            </select>
          </SelectWrapper>
        </div>

        {/* Escuela */}
        <div>
          <label id="label-escuela" className="block text-[13px] font-medium text-slate-700 mb-1.5">Escuela</label>
          <SelectWrapper>
            <select
              aria-labelledby="label-escuela"
              value={filters.escuela}
              onChange={e => setFilters(p => ({ ...p, escuela: e.target.value }))}
              className={selectClassName}
            >
              <option value="">Todas las escuelas</option>
              <option value="Escuela de Ciencias de la Computación e Informática (ECCI)">Escuela de Ciencias de la Computación e Informática</option>
              <option value="Escuela de Ingeniería Eléctrica">Escuela de Ingeniería Eléctrica</option>
            </select>
          </SelectWrapper>
        </div>

        {/* Carrera UCR */}
        <div>
          <label id="label-carrera" className="block text-[13px] font-medium text-slate-700 mb-1.5">Carrera UCR</label>
          <SelectWrapper>
            <select
              aria-labelledby="label-carrera"
              value={filters.carrera}
              onChange={e => setFilters(p => ({ ...p, carrera: e.target.value }))}
              className={selectClassName}
            >
              <option value="">Todas las carreras</option>
              {CARRERAS_UCR.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </SelectWrapper>
        </div>

        {/* Sector */}
        <div>
          <label id="label-sector" className="block text-[13px] font-medium text-slate-700 mb-1.5">Sector</label>
          <SelectWrapper>
            <select
              aria-labelledby="label-sector"
              value={filters.sector}
              onChange={e => setFilters(p => ({ ...p, sector: e.target.value }))}
              className={selectClassName}
            >
              <option value="">Todos los sectores</option>
              {['Tecnología e Informática', 'Finanzas y Banca', 'Salud y Ciencias Médicas', 'Educación e Investigación'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </SelectWrapper>
        </div>

        {/* Tipo de Apoyo */}
        <div>
          <label id="label-apoyo" className="block text-[13px] font-medium text-slate-700 mb-1.5">Tipo de Apoyo</label>
          <SelectWrapper>
            <select
              aria-labelledby="label-apoyo"
              value={filters.apoyo}
              onChange={e => setFilters(p => ({ ...p, apoyo: e.target.value }))}
              className={selectClassName}
            >
              <option value="">Todos los tipos</option>
              {APOYO_FILTROS.map(a => (
                <option key={a.key} value={a.key}>{a.label}</option>
              ))}
            </select>
          </SelectWrapper>
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
    search: '', facultad: '', escuela: '', carrera: '', sector: '', apoyo: ''
  })
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filtered = useMemo(() => {
    return MOCK_EXALUMNOS.filter(ex => {
      // Búsqueda por nombre (case-insensitive)
      if (filters.search && !ex.nombre.toLowerCase().includes(filters.search.toLowerCase())) return false
      // Facultad (simulado en escuela_facultad)
      if (filters.facultad && !ex.escuela_facultad.includes(filters.facultad)) return false
      // Escuela
      if (filters.escuela && !ex.escuela_facultad.includes(filters.escuela)) return false
      // Carrera
      if (filters.carrera && !ex.carrera_ucr.includes(filters.carrera)) return false
      // Sectores
      if (filters.sector && !ex.sector_industria.includes(filters.sector)) return false
      // Tipo de apoyo
      if (filters.apoyo && !ex[filters.apoyo as keyof ExalumnoPublic]) return false
      return true
    })
  }, [filters])

  const activeFilterCount = (filters.facultad ? 1 : 0) + (filters.escuela ? 1 : 0) + (filters.carrera ? 1 : 0) + (filters.sector ? 1 : 0) + (filters.apoyo ? 1 : 0)

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
              placeholder="Buscar por nombre de exalumno…"
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden h-12 px-4 flex items-center gap-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-blue-400 transition-all shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-blue-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Chips de filtros activos */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.sector && (
              <span className="flex items-center gap-1.5 bg-institutional/10 text-institutional text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Sector: {filters.sector}
                <button type="button" aria-label="Quitar filtro sector" onClick={() => setFilters(p => ({ ...p, sector: '' }))} className="hover:text-institutional/70"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.apoyo && (
              <span className="flex items-center gap-1.5 bg-institutional/10 text-institutional text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Apoyo: {APOYO_FILTROS.find(a => a.key === filters.apoyo)?.label || filters.apoyo}
                <button type="button" aria-label="Quitar filtro apoyo" onClick={() => setFilters(p => ({ ...p, apoyo: '' }))} className="hover:text-institutional/70"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.facultad && (
              <span className="flex items-center gap-1.5 bg-institutional/10 text-institutional text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Facultad: {filters.facultad}
                <button type="button" aria-label="Quitar filtro facultad" onClick={() => setFilters(p => ({ ...p, facultad: '' }))} className="hover:text-institutional/70"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.escuela && (
              <span className="flex items-center gap-1.5 bg-institutional/10 text-institutional text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Escuela: {filters.escuela}
                <button type="button" aria-label="Quitar filtro escuela" onClick={() => setFilters(p => ({ ...p, escuela: '' }))} className="hover:text-institutional/70"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.carrera && (
              <span className="flex items-center gap-1.5 bg-institutional/10 text-institutional text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Carrera: {filters.carrera}
                <button type="button" aria-label="Quitar filtro carrera" onClick={() => setFilters(p => ({ ...p, carrera: '' }))} className="hover:text-institutional/70"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

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
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {filtered.length} exalumno{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map(ex => <ExalumnoCard key={ex.id} ex={ex} />)}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Sin resultados</h3>
                <p className="text-xs text-slate-400 font-medium mb-4">Ningún exalumno coincide con los filtros seleccionados.</p>
                <button
                  onClick={() => setFilters({ search: '', facultad: '', escuela: '', carrera: '', sector: '', apoyo: '' })}
                  className="text-xs font-bold text-blue-700 hover:underline uppercase tracking-wider"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
