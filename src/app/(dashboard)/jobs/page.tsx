'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Search, Filter, Briefcase, MapPin, Building, Plus } from 'lucide-react'
import { Select } from '@/components/ui/input'
import { useProfile } from '@/contexts/ProfileContext'

import { listarPosicionesPublicas } from '@/actions/positions'

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModality, setSelectedModality] = useState('all')
  const [dbJobs, setDbJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useProfile()
  const isAdmin = user?.user_metadata?.rol === 'admin' || user?.user_metadata?.tipo === 'admin'

  React.useEffect(() => {
    async function loadJobs() {
      try {
        const positions = await listarPosicionesPublicas()
        setDbJobs(positions || [])
      } catch (err) {
        console.error("Error loading jobs", err)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [])

  const filteredJobs = dbJobs.filter((job) => {
    const titleMatch = (job.titulo || '').toLowerCase().includes(searchTerm.toLowerCase())
    const companyMatch = (job.empresa || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSearch = titleMatch || companyMatch
    const matchesModality = selectedModality === 'all' || (job.modalidad && job.modalidad.toLowerCase() === selectedModality.toLowerCase())
    return matchesSearch && matchesModality
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-10 px-6 lg:px-10 relative overflow-hidden">
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
<<<<<<< HEAD
          {!isAdmin && (
            <Link href="/jobs/publish">
              <Button variant="primary" className="bg-brand-blue hover:bg-brand-blue/90 font-bold uppercase tracking-wider text-xs px-6 py-3 flex items-center gap-2 shadow-md">
                <Plus className="w-4 h-4" />
                <span>Publicar Oportunidad</span>
              </Button>
            </Link>
          )}
=======
          <Link href="/jobs/publish">
            <Button variant="primary" className="bg-[#F34B26] hover:bg-[#C82A08] hover:scale-105 active:scale-95 transition-all duration-300 font-bold uppercase tracking-wider text-xs px-6 py-3 flex items-center gap-2 shadow-md border-0">
              <Plus className="w-4 h-4" />
              <span>Publicar Oportunidad</span>
            </Button>
          </Link>
>>>>>>> 225b1fbfd597bf561489650a1ecba9a0fb040680
        </div>

        {/* Buscador y Filtros Rápidos */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
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
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              options={[
                { value: 'all', label: 'Todas las Modalidades' },
                { value: 'Remoto', label: '100% Remoto' },
                { value: 'Híbrido', label: 'Híbrido' },
                { value: 'Presencial', label: 'Presencial' }
              ]}
              className="h-12 bg-slate-50 border-slate-200 focus:border-[#F34B26] rounded-xl text-sm text-slate-800"
            />
          </div>
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
