'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Send } from 'lucide-react'
import { getTallerById, postularTaller } from '@/actions/talleres'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'

export default function DetalleTallerEstudiantePage() {
  const { id } = useParams() as { id: string }
  const [taller, setTaller] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [postulando, setPostulando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarTaller = useCallback(async () => {
    setCargando(true)
    try {
      const data = await getTallerById(id)
      setTaller(data)
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => { cargarTaller() }, [cargarTaller])

  const handlePostular = async (e: React.FormEvent) => {
    e.preventDefault()
    setPostulando(true)
    setError(null)
    try {
      await postularTaller(id, mensaje)
      setExito(true)
    } catch (e: any) {
      setError(e.message || 'Error al enviar la postulación')
    } finally {
      setPostulando(false)
    }
  }

  if (cargando) return <div className="p-10 text-center text-slate-500">Cargando taller...</div>
  if (!taller) return <div className="p-10 text-center text-red-500">Taller no encontrado o no disponible.</div>

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/talleres" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Volver a Talleres
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8 rounded-2xl border border-slate-200">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-4">
                  {taller.modalidad}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-4">{taller.titulo}</h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span>{new Date(taller.fecha_taller).toLocaleString()}</span>
                  </div>
                  {taller.cupos && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-400" />
                      <span>Cupos totales: {taller.cupos}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Acerca del taller</h3>
                <p className="whitespace-pre-wrap text-slate-700">{taller.descripcion}</p>
              </div>
              
              {taller.multimedia_urls && taller.multimedia_urls.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Material de apoyo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {taller.multimedia_urls.map((url: string, index: number) => (
                      <div key={index} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={url} alt={`Material ${index + 1}`} className="w-full h-auto object-cover max-h-48" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 rounded-2xl border border-slate-200 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Impartido por</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  {taller.users?.foto_url ? (
                    <img src={taller.users.foto_url} alt="Exalumno" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                      {taller.users?.nombre?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{taller.users?.nombre} {taller.users?.apellidos}</div>
                  <div className="text-sm text-slate-500">Exalumno UCR</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border border-slate-200 bg-blue-50/50">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Postúlate a este taller</h3>
              <p className="text-sm text-slate-600 mb-6">El exalumno revisará tu postulación y te confirmará tu espacio.</p>
              
              {exito ? (
                <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl text-center font-medium border border-emerald-200">
                  ¡Postulación enviada exitosamente! Recibirás una notificación cuando sea revisada.
                </div>
              ) : (
                <form onSubmit={handlePostular} className="space-y-4">
                  {error && (
                    <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje (Opcional)</label>
                    <textarea 
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Cuéntale al exalumno por qué te interesa este taller..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button type="submit" disabled={postulando} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11">
                    {postulando ? 'Enviando...' : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Postulación
                      </>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
