import React from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import RegisterOpportunityButton from './RegisterOpportunityButton'

interface GiveBackDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function GiveBackDetailPage({ params }: GiveBackDetailPageProps) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: opp, error } = await supabase.from('opportunities').select('*').eq('id', id).single()

  if (error || !opp) {
    return (
      <div className="space-y-6 text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700">Oportunidad no encontrada</h2>
        <Link href="/give-back" className="inline-flex items-center gap-2 text-sm font-bold text-brand-emerald hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Volver a oportunidades
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <Link href="/give-back" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-emerald transition-colors uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a oportunidades</span>
      </Link>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ficha de Detalles */}
        <div className="lg:col-span-2 space-y-6">
          <Card hoverEffect={false} className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                {opp.category || 'Oportunidad'}
              </span>
              <h1 className="text-2xl font-extrabold uppercase font-display text-slate-800 tracking-wide">
                {opp.title}
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed pt-2">
                {opp.description}
              </p>
            </div>

            {opp.requirements && Array.isArray(opp.requirements) && (
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider">
                  Requisitos de participación
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                  {opp.requirements.map((req: any, idx: number) => (
                    <li key={idx} className="leading-relaxed">{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* Tarjeta de Acción */}
        <div>
          <Card hoverEffect={false} className="space-y-6">
            <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider text-center">
              Tu Compromiso
            </h3>
            
            <div className="space-y-3 text-xs text-slate-600 font-medium">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Compromiso: {opp.duration}</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Fecha: {opp.schedule}</span>
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <RegisterOpportunityButton />
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
