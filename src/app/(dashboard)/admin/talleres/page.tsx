'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { getAllTalleresAdmin, updateTallerEstadoAdmin } from '@/actions/talleres'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'

export default function AdminTalleresPage() {
  const [talleres, setTalleres] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const cargarTalleres = useCallback(async () => {
    setCargando(true)
    try {
      const data = await getAllTalleresAdmin()
      setTalleres(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarTalleres() }, [cargarTalleres])

  const handleUpdate = async (id: string, estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO') => {
    try {
      await updateTallerEstadoAdmin(id, estado)
      setTalleres(prev => prev.map(t => t.id === id ? { ...t, estado } : t))
    } catch (error) {
      console.error(error)
      alert('Error al actualizar taller')
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold uppercase font-display text-slate-900">
          Administración de Talleres
        </h1>
        <p className="text-slate-500 mt-1">Revisa y aprueba los talleres ofrecidos por exalumnos.</p>
      </div>

      {cargando ? (
        <div className="text-center py-10 text-slate-500">Cargando talleres...</div>
      ) : talleres.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">No hay talleres registrados en el sistema.</Card>
      ) : (
        <div className="space-y-4">
          {talleres.map(taller => (
            <Card key={taller.id} className="p-6 flex flex-col md:flex-row gap-6 border border-slate-200">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{taller.titulo}</h3>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                    taller.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' :
                    taller.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {taller.estado}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4">{taller.descripcion}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                  <div><strong>Exalumno:</strong> {taller.users?.nombre} {taller.users?.apellidos}</div>
                  <div><strong>Email:</strong> {taller.users?.email}</div>
                  <div><strong>Fecha:</strong> {new Date(taller.fecha_taller).toLocaleString()}</div>
                  <div><strong>Modalidad:</strong> {taller.modalidad}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                {taller.estado === 'PENDIENTE' && (
                  <>
                    <Button 
                      onClick={() => handleUpdate(taller.id, 'APROBADO')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Aprobar
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => handleUpdate(taller.id, 'RECHAZADO')}
                      className="text-red-600 border-red-200 hover:bg-red-50 w-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Rechazar
                    </Button>
                  </>
                )}
                {taller.estado !== 'PENDIENTE' && (
                  <Button 
                    variant="secondary"
                    onClick={() => handleUpdate(taller.id, 'PENDIENTE')}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50 w-full"
                  >
                    <Clock className="w-4 h-4 mr-2" /> Revertir a Pendiente
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
