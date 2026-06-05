'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, SlidersHorizontal, MapPin, Briefcase, GraduationCap,
  Heart, Users, X, Handshake, Building
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
    <Card hoverEffect={true} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full ${ex.avatarBg} text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md`}>
          {ex.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wide leading-tight">{ex.nombre}</h3>
          <p className="text-xs font-bold text-blue-700 mt-0.5">{ex.cargo_actual}</p>
          <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
            <Building className="w-3 h-3 shrink-0" />{ex.empresa_actual}
          </p>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />{ex.pais_ciudad}
          </p>
        </div>
      </div>

      {/* Carrera */}
      <div className="flex flex-wrap gap-1.5">
        {ex.carrera_ucr.map(c => (
          <span key={c} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />{c}
          </span>
        ))}
      </div>

      {/* Áreas de interés */}
      <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Áreas de interés</p>
        <div className="flex flex-wrap gap-1.5">
          {ex.areas_de_interes.slice(0, 3).map(a => (
            <span key={a} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{a}</span>
          ))}
          {ex.areas_de_interes.length > 3 && (
            <span className="bg-slate-100 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">+{ex.areas_de_interes.length - 3}</span>
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
      <div className="mt-auto pt-2 border-t border-slate-100">
        <Link href={`/network/${ex.id}`}>
          <Button variant="primary" className="w-full bg-blue-700 hover:bg-blue-800 font-bold uppercase tracking-wider text-xs py-2.5">
            Conectar →
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
  carreras: string[]
  sectores: string[]
  areas: string[]
  apoyo: string[]
  pais: string
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
  const toggle = (field: 'carreras' | 'sectores' | 'areas' | 'apoyo', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  const clearAll = () => setFilters({ search: '', carreras: [], sectores: [], areas: [], apoyo: [], pais: '' })
  const hasFilters = filters.carreras.length > 0 || filters.sectores.length > 0 || filters.areas.length > 0 || filters.apoyo.length > 0 || filters.pais

  return (
    <div className="space-y-5">
    <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Filtros</h3>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button type="button" onClick={clearAll} className="text-[10px] font-bold text-rose-600 hover:text-rose-800 uppercase tracking-wider transition-colors">
              Limpiar todo
            </button>
          )}
          {onClose && (
            <button type="button" aria-label="Cerrar filtros" onClick={() => onClose()} className="p-1 text-slate-400 hover:text-slate-700 lg:hidden">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* País */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">País / Ciudad</p>
        <input
          type="text"
          value={filters.pais}
          onChange={e => setFilters(p => ({ ...p, pais: e.target.value }))}
          placeholder="Ej: Costa Rica, Madrid…"
          className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800"
        />
      </div>

      {/* Tipo de Apoyo */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Apoyo</p>
        <div className="space-y-1.5">
          {APOYO_FILTROS.map(a => (
            <label key={a.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.apoyo.includes(a.key)}
                onChange={() => toggle('apoyo', a.key)}
                className="w-3.5 h-3.5 rounded text-blue-700 focus:ring-blue-600"
              />
              <span className="text-xs font-semibold text-slate-700">{a.icon} {a.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Carreras */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Carrera UCR</p>
        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
          {CARRERAS_UCR.slice(0, 15).map(c => (
            <label key={c} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.carreras.includes(c)}
                onChange={() => toggle('carreras', c)}
                className="w-3.5 h-3.5 rounded text-blue-700 focus:ring-blue-600"
              />
              <span className="text-xs font-semibold text-slate-700">{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sectores */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sector / Industria</p>
        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
          {SECTORES_INDUSTRIA.map(s => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.sectores.includes(s)}
                onChange={() => toggle('sectores', s)}
                className="w-3.5 h-3.5 rounded text-blue-700 focus:ring-blue-600"
              />
              <span className="text-xs font-semibold text-slate-700">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Áreas de Interés */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Áreas de Interés</p>
        <div className="space-y-1.5">
          {AREAS_INTERES.map(a => (
            <label key={a} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.areas.includes(a)}
                onChange={() => toggle('areas', a)}
                className="w-3.5 h-3.5 rounded text-blue-700 focus:ring-blue-600"
              />
              <span className="text-xs font-semibold text-slate-700">{a}</span>
            </label>
          ))}
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
    search: '', carreras: [], sectores: [], areas: [], apoyo: [], pais: ''
  })
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filtered = useMemo(() => {
    return MOCK_EXALUMNOS.filter(ex => {
      // Búsqueda por nombre (case-insensitive)
      if (filters.search && !ex.nombre.toLowerCase().includes(filters.search.toLowerCase())) return false
      // País
      if (filters.pais && !ex.pais_ciudad.toLowerCase().includes(filters.pais.toLowerCase())) return false
      // Carreras (AND: todas las seleccionadas deben estar presentes)
      if (filters.carreras.length > 0 && !filters.carreras.some(c => ex.carrera_ucr.includes(c))) return false
      // Sectores
      if (filters.sectores.length > 0 && !filters.sectores.some(s => ex.sector_industria.includes(s))) return false
      // Áreas de interés
      if (filters.areas.length > 0 && !filters.areas.some(a => ex.areas_de_interes.includes(a))) return false
      // Tipo de apoyo
      if (filters.apoyo.length > 0 && !filters.apoyo.every(k => ex[k as keyof ExalumnoPublic] === true)) return false
      return true
    })
  }, [filters])

  const activeFilterCount = filters.carreras.length + filters.sectores.length + filters.areas.length + filters.apoyo.length + (filters.pais ? 1 : 0)

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
            {[...filters.carreras, ...filters.sectores, ...filters.areas].map(v => (
              <span key={v} className="flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                {v}
                <button type="button" aria-label={`Quitar filtro ${v}`} onClick={() => setFilters(p => ({
                  ...p,
                  carreras: p.carreras.filter(c => c !== v),
                  sectores: p.sectores.filter(s => s !== v),
                  areas: p.areas.filter(a => a !== v),
                }))} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            ))}
            {filters.apoyo.map(k => {
              const a = APOYO_FILTROS.find(f => f.key === k)
              return a ? (
                <span key={k} className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  {a.icon} {a.label}
                  <button type="button" aria-label={`Quitar filtro ${a.label}`} onClick={() => setFilters(p => ({ ...p, apoyo: p.apoyo.filter(v => v !== k) }))} className="hover:text-emerald-900"><X className="w-3 h-3" /></button>
                </span>
              ) : null
            })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(ex => <ExalumnoCard key={ex.id} ex={ex} />)}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Sin resultados</h3>
                <p className="text-xs text-slate-400 font-medium mb-4">Ningún exalumno coincide con los filtros seleccionados.</p>
                <button
                  onClick={() => setFilters({ search: '', carreras: [], sectores: [], areas: [], apoyo: [], pais: '' })}
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
