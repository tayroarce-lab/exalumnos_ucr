'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { getTallerById, getPostulacionesPorTaller, responderPostulacion } from '@/actions/talleres'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'

export default function DetalleTallerPage() {
  const { id } = useParams() as { id: string }
  const [taller, setTaller] = useState<any>(null)
  const [postulaciones, setPostulaciones] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    try {
      const [tallerData, postulacionesData] = await Promise.all([
        getTallerById(id),
        getPostulacionesPorTaller(id)
      ])
      setTaller(tallerData)
      setPostulaciones(postulacionesData ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const handleResponder = async (postulacionId: string, estado: 'ACEPTADO' | 'RECHAZADO') => {
    try {
      await responderPostulacion(postulacionId, estado)
      setPostulaciones(prev => prev.map(p => p.id === postulacionId ? { ...p, estado } : p))
    } catch (error) {
      console.error(error)
      alert('Error al responder postulación')
    }
  }

  if (cargando) return <div className="p-10 text-center text-slate-500">Cargando detalles...</div>
  if (!taller) return <div className="p-10 text-center text-red-500">Taller no encontrado.</div>

  const aceptados = postulaciones.filter(p => p.estado === 'ACEPTADO').length
  const cuposLlenos = taller.cupos !== null && aceptados >= taller.cupos

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/mis-talleres" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Volver a Mis Talleres
        </Link>
        
        <Card className="p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">{taller.titulo}</h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${taller.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-700' : taller.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {taller.estado}
            </span>
          </div>
          <p className="text-slate-600 mb-6">{taller.descripcion}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-500" />
              {new Date(taller.fecha_taller).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-slate-500" />
              {taller.modalidad}
            </div>
            {taller.cupos !== null && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
                <Users className="w-4 h-4" />
                Cupos: {aceptados} / {taller.cupos}
              </div>
            )}
          </div>
        </Card>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Estudiantes Postulados ({postulaciones.length})</h2>
        
        {postulaciones.length === 0 ? (
          <Card className="p-8 text-center bg-white text-slate-500 border border-slate-200 shadow-sm rounded-2xl">
            No hay postulaciones aún.
          </Card>
        ) : (
          <div className="space-y-4">
            {postulaciones.map(postulacion => (
              <Card key={postulacion.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden flex-shrink-0">
                    {postulacion.users.foto_url ? (
                      <img src={postulacion.users.foto_url} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                        {postulacion.users.nombre[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{postulacion.users.nombre} {postulacion.users.apellidos}</h4>
                    <p className="text-sm text-slate-500">{postulacion.users.email}</p>
                    {postulacion.mensaje && (
                      <p className="text-sm text-slate-600 mt-1 italic">"{postulacion.mensaje}"</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  {postulacion.estado === 'PENDIENTE' ? (
                    <>
                      <Button 
                        disabled={cuposLlenos}
                        onClick={() => handleResponder(postulacion.id, 'ACEPTADO')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 h-9"
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Aceptar
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => handleResponder(postulacion.id, 'RECHAZADO')}
                        className="text-red-600 hover:bg-red-50 border-red-200 rounded-lg px-4 h-9"
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${postulacion.estado === 'ACEPTADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {postulacion.estado === 'ACEPTADO' ? 'Aceptado' : 'Rechazado'}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
