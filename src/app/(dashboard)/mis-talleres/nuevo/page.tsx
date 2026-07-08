'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UploadCloud, Save } from 'lucide-react'
import { createTaller, TallerInsert } from '@/actions/talleres'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function NuevoTallerPage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState('')
  const [modalidad, setModalidad] = useState<'ONLINE' | 'PRESENCIAL' | 'HIBRIDO'>('ONLINE')
  const [ubicacionUrl, setUbicacionUrl] = useState('')
  const [cupos, setCupos] = useState<number | ''>('')
  
  const [file, setFile] = useState<File | null>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError(null)
    
    try {
      const supabase = createClient();
      let multimedia_urls: string[] = [];

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `talleres/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('talleres_media')
          .upload(filePath, file);
          
        if (uploadError) {
          throw new Error('Error al subir la imagen');
        }

        const { data } = supabase.storage.from('talleres_media').getPublicUrl(filePath);
        multimedia_urls.push(data.publicUrl);
      }

      const tallerData: TallerInsert = {
        exalumno_id: '', // Set on backend
        titulo,
        descripcion,
        fecha_taller: new Date(fecha).toISOString(),
        modalidad,
        ubicacion_url: ubicacionUrl || null,
        cupos: cupos === '' ? null : Number(cupos),
        multimedia_urls
      }

      await createTaller(tallerData)
      router.push('/mis-talleres')
    } catch (e: any) {
      setError(e.message || 'Error al crear el taller')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/mis-talleres" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Volver a Mis Talleres
        </Link>
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Crear Nuevo Taller</h1>
          <p className="text-sm text-slate-500 mt-1">Completa los detalles del taller que deseas impartir.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título del Taller <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Introducción a Inteligencia Artificial"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe de qué trata el taller, qué aprenderán los estudiantes..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-y"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha y Hora <span className="text-red-500">*</span></label>
                  <input 
                    type="datetime-local" 
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Modalidad <span className="text-red-500">*</span></label>
                  <select 
                    value={modalidad}
                    onChange={(e) => setModalidad(e.target.value as any)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cupos (Capacidad máxima)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={cupos}
                    onChange={(e) => setCupos(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 20"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Dejar en blanco para sin límite.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Enlace de Ubicación (Zoom, Maps)</label>
                  <input 
                    type="url" 
                    value={ubicacionUrl}
                    onChange={(e) => setUbicacionUrl(e.target.value)}
                    placeholder="https://zoom.us/..."
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Imagen de Portada (Opcional)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700 mb-1">Seleccionar archivo</p>
                  <p className="text-xs text-slate-500 mb-4">PNG, JPG hasta 5MB</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              </div>
            </div>
          </Card>
          
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={cargando} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-11 shadow-sm">
              {cargando ? 'Guardando...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Taller
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
