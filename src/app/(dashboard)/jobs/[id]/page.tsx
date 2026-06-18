'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { ArrowLeft, MapPin, Building, Briefcase, Calendar, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react'
import { obtenerPosicionPorId } from '@/actions/positions'
import { createClient } from '@/lib/supabase/client'
import ApplyModal from '@/components/applications/ApplyModal'

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = React.use(params)

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [hasCV, setHasCV] = useState<boolean | null>(null)
  const [showNoCVNotice, setShowNoCVNotice] = useState(false)

  React.useEffect(() => {
    async function loadJob() {
      try {
        const position = await obtenerPosicionPorId(id)
        setJob(position)
      } catch (err) {
        console.error("Error loading position:", err)
      } finally {
        setLoading(false)
      }
    }
    loadJob()
  }, [id])

  // Verificar si el usuario tiene CV en la base de datos
  React.useEffect(() => {
    async function checkCV() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
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
  }, [])

  const handleApplyClick = () => {
    if (hasCV === false) {
      setShowNoCVNotice(true)
      return
    }
    setIsModalOpen(true)
  }

  const handleSuccess = () => {
    setIsApplied(true)
    setIsModalOpen(false)
  }

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-bold uppercase">Cargando detalles de la vacante...</div>
  }

  if (!job) {
    return <div className="text-center py-20 text-red-500 font-bold uppercase">Posición no encontrada</div>
  }

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <Link href="/jobs" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-emerald transition-colors uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a vacantes</span>
      </Link>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Información de Puesto */}
        <div className="lg:col-span-2 space-y-6">
          <Card hoverEffect={false} className="space-y-6">
            <div className="flex items-start gap-4 flex-col sm:flex-row">
              <div className="w-14 h-14 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center shrink-0">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold uppercase font-display text-slate-800 tracking-wide">
                  {job.titulo}
                </h1>
                <p className="text-sm font-semibold text-brand-emerald">{job.empresa}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.lugar || 'No especificado'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Publicado {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                Descripción del puesto
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {job.descripcion_general}
              </p>
            </div>

            {job.requirements && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                  Requisitos clave
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                  {job.habilidades_requeridas.map((req: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsabilidades && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                  Responsabilidades principales
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                  {job.responsabilidades.map((resp: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{resp}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* Columna Derecha: Tarjeta de Acción */}
        <div className="space-y-6">
          <Card hoverEffect={false} className="space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Compensación</span>
              <span className="text-xl font-bold text-brand-emerald block">Competitivo</span>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Moneda local (CRC)</span>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              {isApplied ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>¡Aplicación enviada con éxito!</span>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleApplyClick}
                    className="w-full h-12 text-sm uppercase tracking-wider font-bold"
                  >
                    Aplicar Ahora
                  </Button>
                  <Link href={`/jobs/${id}/adaptar`} className="w-full">
                    <Button
                      variant="secondary"
                      className="w-full h-12 text-sm uppercase tracking-wider font-bold mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2 inline" />
                      Adaptar CV con IA
                    </Button>
                  </Link>
                </>
              )}
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Requiere validación de grado UCR
              </span>
            </div>
          </Card>
        </div>

      </div>

      {/* Modal: Sin CV */}
      {showNoCVNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 text-center">
            <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Necesitas un CV para aplicar</h2>
              <p className="text-sm text-slate-500">No tienes ningún currículum guardado. Créalo con IA en minutos y ¡empieza a postularte!</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/cv"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#001C29] hover:bg-[#004C63] text-white text-sm font-bold py-3 rounded-xl transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Crear mi CV con IA
              </Link>
              <button
                onClick={() => setShowNoCVNotice(false)}
                className="w-full text-sm font-medium text-slate-500 hover:text-slate-800 py-2 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Real de Aplicación */}
      {isModalOpen && (
        <ApplyModal
          position={{ id: job.id, title: job.titulo, alumni_name: job.exalumno?.nombre || 'Exalumno' }}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
