'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Search, Briefcase, MapPin, Building, Plus, Sparkles, X } from 'lucide-react'
import { Select } from '@/components/ui/input'
import { useProfile } from '@/contexts/ProfileContext'
import { createClient } from '@/lib/supabase/client'

import { listarPosicionesPublicas } from '@/actions/positions'

const SECTORES_CATALOGO = [
  'Tecnología',
  'Finanzas',
  'Educación',
  'Salud',
  'Ingeniería',
  'Artes y Diseño',
  'Marketing',
  'Derecho',
  'Ciencias',
  'Agronomía',
]

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModality, setSelectedModality] = useState('all')
  const [selectedTipo, setSelectedTipo] = useState('all')
  const [selectedJornada, setSelectedJornada] = useState('all')
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [skillsSearch, setSkillsSearch] = useState('')

  const [dbJobs, setDbJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasCV, setHasCV] = useState<boolean | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const { user } = useProfile()
  const isAdmin = user?.user_metadata?.rol === 'admin' || user?.user_metadata?.tipo === 'admin'
  const isStudent = user?.user_metadata?.rol === 'estudiante'

  // Verificar si el usuario tiene CV
  useEffect(() => {
    async function checkCV() {
      if (!user) return
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('cv_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        setHasCV(!!data)
      } catch {
        setHasCV(false)
      }
    }
    checkCV()
  }, [user])

  useEffect(() => {
    async function loadJobs() {
      setLoading(true)
      try {
        const filters: any = {}
        if (selectedTipo !== 'all') filters.tipo = selectedTipo
        if (selectedModality !== 'all') filters.modalidad = selectedModality
        if (selectedJornada !== 'all') filters.jornada = selectedJornada
        if (selectedSectors.length > 0) filters.sector = selectedSectors

        const positions = await listarPosicionesPublicas(filters)
        setDbJobs(positions || [])
      } catch (err) {
        console.error("Error loading jobs", err)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [selectedTipo, selectedModality, selectedJornada, selectedSectors])

  const filteredJobs = dbJobs.filter((job) => {
    const titleMatch = (job.titulo || '').toLowerCase().includes(searchTerm.toLowerCase())
    const companyMatch = (job.empresa || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSearch = titleMatch || companyMatch

    const matchesSkills = !skillsSearch.trim() || job.habilidades_requeridas?.some((h: string) =>
      h.toLowerCase().includes(skillsSearch.toLowerCase())
    )

    return matchesSearch && matchesSkills
  })

  // Mostrar banner si: es estudiante, no tiene CV, y no lo ha cerrado
  const showCVBanner = isStudent && hasCV === false && !bannerDismissed

  return (
    <div className="bg-transparent min-h-screen py-10 px-6 lg:px-10 relative overflow-hidden transition-colors duration-300">
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-[#F34B26]/8 rounded-full blur-3xl -z-10"></div>
      <div className="absolute left-10 bottom-10 w-72 h-72 bg-[#FF9B18]/8 rounded-full blur-2xl -z-10"></div>

      <div className="space-y-8 max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wider">
              Bolsa de Empleo
            </h1>
            <p className="text-sm text-slate-700 font-medium max-w-2xl leading-relaxed">
              Encuentra y publica oportunidades de empleo exclusivas para la comunidad UCR.
            </p>
          </div>
          {!isAdmin && (
            <Link href="/jobs/publish">
              <Button variant="primary" className="bg-[#F34B26] hover:bg-[#C82A08] hover:scale-105 active:scale-95 transition-all duration-300 font-bold uppercase tracking-wider text-xs px-6 py-3 flex items-center gap-2 shadow-md border-0">
                <Plus className="w-4 h-4" />
                <span>Publicar Oportunidad</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Banner CV — solo si el estudiante no tiene CV */}
        {showCVBanner && (
          <div className="relative overflow-hidden rounded-2xl border border-[#54BCEB]/30 bg-gradient-to-r from-[#001C29] to-[#004C63] p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Fondo decorativo */}
            <div className="absolute right-0 top-0 w-48 h-48 bg-[#54BCEB]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-16 bottom-0 w-32 h-32 bg-[#F34B26]/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#54BCEB]/20 border border-[#54BCEB]/30 shrink-0">
              <Sparkles className="w-6 h-6 text-[#54BCEB]" />
            </div>

            <div className="flex-1 relative z-10">
              <p className="text-white font-bold text-base leading-snug">
                ¿Quieres postularte? Haz tu CV mejorado por IA
              </p>
              <p className="text-white/60 text-xs mt-0.5 font-medium">
                Crea tu currículum optimizado para ATS y aplica a empleos y pasantías con un solo clic.
              </p>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0">
              <Link href="/dashboard/cv">
                <button className="inline-flex items-center gap-2 bg-[#54BCEB] hover:bg-[#3DAAD8] text-[#001C29] text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  Crear mi CV con IA
                </button>
              </Link>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                aria-label="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Buscador y Filtros Rápidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por puesto o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#F34B26] focus:bg-white focus:ring-4 focus:ring-[#F34B26]/10 transition-all text-slate-800"
              />
            </div>
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Filtrar por habilidad..."
                value={skillsSearch}
                onChange={(e) => setSkillsSearch(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#F34B26] focus:bg-white focus:ring-4 focus:ring-[#F34B26]/10 transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tipo</label>
              <Select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos los tipos' },
                  { value: 'empleo', label: 'Empleo' },
                  { value: 'pasantia', label: 'Pasantía' }
                ]}
                className="h-11 bg-slate-50 border-slate-200 focus:border-[#F34B26] rounded-xl text-sm text-slate-800 w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modalidad</label>
              <Select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas las Modalidades' },
                  { value: 'remoto', label: '100% Remoto' },
                  { value: 'hibrido', label: 'Híbrido' },
                  { value: 'presencial', label: 'Presencial' }
                ]}
                className="h-11 bg-slate-50 border-slate-200 focus:border-[#F34B26] rounded-xl text-sm text-slate-800 w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jornada</label>
              <Select
                value={selectedJornada}
                onChange={(e) => setSelectedJornada(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas las Jornadas' },
                  { value: 'tiempo_completo', label: 'Tiempo Completo' },
                  { value: 'medio_tiempo', label: 'Medio Tiempo' },
                  { value: 'por_proyecto', label: 'Por Proyecto' }
                ]}
                className="h-11 bg-slate-50 border-slate-200 focus:border-[#F34B26] rounded-xl text-sm text-slate-800 w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sectores</label>
              <select
                multiple
                value={selectedSectors}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, (option) => option.value)
                  setSelectedSectors(values.includes('all') ? [] : values)
                }}
                className="h-11 bg-slate-50 border border-slate-200 focus:border-[#F34B26] rounded-xl text-sm text-slate-800 w-full px-2"
              >
                {SECTORES_CATALOGO.map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedSectors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase self-center mr-1">Sectores activos:</span>
              {selectedSectors.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSectors(prev => prev.filter(s => s !== sec))}
                  className="bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors"
                >
                  {sec} ✕
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listado de Vacantes */}
        <div className="space-y-5">
          {loading ? (
            <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl text-slate-400 font-medium text-sm shadow-sm">
              Cargando oportunidades...
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                hoverEffect={true}
                className="p-6 rounded-2xl border border-slate-200/60 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="w-14 h-14 rounded-xl bg-[#F34B26]/10 text-[#F34B26] border border-[#F34B26]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display font-extrabold text-lg text-slate-900 uppercase tracking-wide">
                        {job.titulo}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Publicado {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-700 font-semibold">
                      <span className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#F34B26]" />
                        {job.empresa}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#F34B26]" />
                        {job.lugar || 'No especificado'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed py-1 line-clamp-2">
                      {job.descripcion_general}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                      <div className="flex gap-2">
                        <span className="bg-orange-50 text-[#F34B26] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {job.jornada?.replace('_', ' ') || 'Tiempo Completo'}
                        </span>
                        <span className="bg-[#FF9B18]/10 text-[#FF9B18] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {job.modalidad || 'Híbrido'}
                        </span>
                      </div>
                      <Link href={`/jobs/${job.id}`}>
                        <span className="text-xs font-bold text-[#F34B26] hover:text-[#C82A08] transition-colors uppercase tracking-wider cursor-pointer">
                          Ver Detalles →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl text-slate-400 font-medium text-sm shadow-sm">
              No se encontraron vacantes que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
