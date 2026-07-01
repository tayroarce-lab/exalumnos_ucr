'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Search } from 'lucide-react'
import { getTalleresAprobados } from '@/actions/talleres'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'

export default function DirectorioTalleresPage() {
  const [talleres, setTalleres] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('')

  const cargarTalleres = useCallback(async () => {
    setCargando(true)
    try {
      const data = await getTalleresAprobados()
      setTalleres(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarTalleres() }, [cargarTalleres])

  const talleresFiltrados = talleres.filter(t => 
    t.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    t.descripcion.toLowerCase().includes(filtro.toLowerCase()) ||
    t.modalidad.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold uppercase font-display text-slate-900">
              Directorio de Talleres
            </h1>
            <p className="text-slate-500 mt-1">Descubre y postúlate a talleres impartidos por exalumnos de la UCR.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar talleres..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : talleresFiltrados.length === 0 ? (
          <Card className="p-12 text-center border-dashed bg-slate-50/50 shadow-none">
            <h3 className="text-lg font-bold text-slate-700 mb-2">No se encontraron talleres</h3>
            <p className="text-slate-500">Intenta con otros términos de búsqueda o vuelve más tarde.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talleresFiltrados.map(taller => (
              <Card key={taller.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 rounded-2xl border border-slate-200 bg-white">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      {taller.modalidad}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                    {taller.titulo}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {taller.users?.foto_url ? (
                        <img src={taller.users.foto_url} alt="Autor" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                          {taller.users?.nombre?.[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {taller.users?.nombre} {taller.users?.apellidos}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{taller.descripcion}</p>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(taller.fecha_taller).toLocaleDateString()}
                    </div>
                    {taller.cupos !== null && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        Cupos totales: {taller.cupos}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <Link href={`/talleres/${taller.id}`} className="block w-full">
                    <Button className="w-full bg-white hover:bg-slate-100 text-blue-600 border border-blue-200 shadow-sm rounded-xl">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
