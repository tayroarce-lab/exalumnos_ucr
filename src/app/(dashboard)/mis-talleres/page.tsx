'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Edit3, Eye, Trash2, Calendar, MapPin, Users } from 'lucide-react'
import { getMisTalleres, Taller } from '@/actions/talleres'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'

const ESTADO_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDIENTE: { label: 'Pendiente', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  APROBADO:  { label: 'Aprobado',  bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  RECHAZADO: { label: 'Rechazado', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

export default function MisTalleresPage() {
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarTalleres = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await getMisTalleres()
      setTalleres(data ?? [])
    } catch (e) {
      setError('No se pudieron cargar tus talleres. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarTalleres() }, [cargarTalleres])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-3xl font-extrabold uppercase font-display text-slate-900 tracking-wide">
              Mis Talleres
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Gestiona los talleres que ofreces a los estudiantes.
            </p>
          </div>
          <Link href="/mis-talleres/nuevo">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-5 h-11 transition-all">
              <Plus className="w-4 h-4" />
              Nuevo Taller
            </Button>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : talleres.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 px-4 text-center border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-2xl shadow-none">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No tienes talleres publicados</h3>
            <p className="text-slate-500 max-w-sm mb-6 text-sm">
              Crea tu primer taller para compartir tus conocimientos y experiencia con estudiantes de la UCR.
            </p>
            <Link href="/mis-talleres/nuevo">
              <Button variant="secondary" className="rounded-xl font-medium border-slate-200">
                Crear Taller
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talleres.map(taller => {
              const conf = ESTADO_CONFIG[taller.estado] || ESTADO_CONFIG['PENDIENTE']
              return (
                <Card key={taller.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 rounded-2xl border border-slate-200/60 bg-white group">
                  <div className="p-5 flex-1 flex flex-col relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${conf.bg} ${conf.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`}></span>
                        {conf.label}
                      </div>
                      <div className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {taller.modalidad}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {taller.titulo}
                    </h3>
                    
                    <div className="mt-auto space-y-2.5 pt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(taller.fecha_taller).toLocaleDateString()}</span>
                      </div>
                      {taller.cupos !== null && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>Cupos: {taller.cupos}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                    <Link href={`/mis-talleres/${taller.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full text-xs rounded-xl bg-white hover:bg-slate-50 border-slate-200">
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
