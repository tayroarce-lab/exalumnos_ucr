import React from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import { Users, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

function AwardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
}

function getCategoryConfig(category: string) {
  if (category === 'Orientación') {
    return {
      categoryColor: 'bg-blue-100 text-blue-700',
      iconBg: 'bg-blue-100 text-blue-700',
      icon: GraduationCap
    }
  }
  if (category === 'Evaluación') {
    return {
      categoryColor: 'bg-indigo-100 text-indigo-700',
      iconBg: 'bg-indigo-100 text-indigo-700',
      icon: AwardIcon
    }
  }
  return {
    categoryColor: 'bg-emerald-100 text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-700',
    icon: Users
  }
}

export default async function GiveBackPage() {
  const supabase = await createClient()
  const { data: opportunities, error } = await supabase.from('opportunities').select('*')
  const displayOpps = opportunities || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-10 px-6 lg:px-10 relative overflow-hidden">
      {/* Decorativos de fondo */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute left-10 bottom-10 w-72 h-72 bg-sky-400/10 rounded-full blur-2xl -z-10"></div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-2 pt-2">
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">
            Retribuir Capital
          </h1>
          <p className="text-sm text-slate-700 font-medium max-w-2xl leading-relaxed">
            Devuelve valor a la comunidad estudiantil de la UCR participando en proyectos académicos y voluntariados.
          </p>
        </div>

        {/* Grid de Oportunidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayOpps.map((opp) => {
            const config = getCategoryConfig(opp.category)
            const IconComponent = config.icon
            
            return (
              <Card key={opp.id} hoverEffect={true} className="flex flex-col justify-between space-y-6 bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl p-6">
                <div className="space-y-3">
                  {/* Ícono */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.iconBg}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Badge de categoría */}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block ${config.categoryColor}`}>
                    {opp.category || 'Oportunidad'}
                  </span>

                  {/* Título */}
                  <h3 className="font-display font-bold text-base text-slate-900 uppercase tracking-wide leading-snug">
                    {opp.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Compromiso:{' '}
                    <span className="text-slate-800 font-bold">{opp.duration}</span>
                  </div>
                  <Link href={`/give-back/${opp.id}`}>
                    <span className="block text-center text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors uppercase tracking-wider pt-2 cursor-pointer">
                      Ver Detalles 
                    </span>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
        
        {displayOpps.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            No hay oportunidades disponibles en este momento.
          </div>
        )}
      </div>
    </div>
  )
}
