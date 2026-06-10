'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { obtenerMisDonaciones } from '@/actions/donaciones'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import {
  Calendar, CreditCard, DollarSign, ArrowLeft, Clock,
  CheckCircle2, XCircle, ChevronRight, HandHeart
} from 'lucide-react'

// Util function to format currency
const formatMoney = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency }).format(amount)
}

// Util function to format date
const formatDate = (dateString: string) => {
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export default function HistorialDonacionesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [donations, setDonations] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await obtenerMisDonaciones()
        if (res.success) {
          setDonations(res.data)
        }
      } catch (err) {
        console.error('Error fetching donations', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-500 uppercase tracking-widest">Cargando historial...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pt-2 space-y-2">
          <Link href="/profile" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-institutional transition-colors uppercase tracking-wider mb-3">
            <ArrowLeft className="w-4 h-4" /> Volver al perfil
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold uppercase font-display text-slate-900 tracking-wide flex items-center gap-3">
                <HandHeart className="w-8 h-8 text-blue-700" />
                Mis Donaciones
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">Historial de aportes realizados a la Fundación UCR.</p>
            </div>
            <Link href="/give-back/donar">
              <Button className="bg-institutional hover:bg-institutional-hover text-white font-bold uppercase tracking-wider text-xs">
                + Nueva Donación
              </Button>
            </Link>
          </div>
        </div>

        {donations.length === 0 ? (
          <Card hoverEffect={false} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center">
            <DollarSign className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-700 uppercase tracking-wide mb-2">Sin donaciones</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Aún no has registrado ninguna donación. Tu aporte puede hacer la diferencia.</p>
            <Link href="/give-back/donar">
              <Button className="bg-blue-700 hover:bg-blue-800 text-white font-bold uppercase tracking-wider text-xs px-6">
                Hacer mi primera donación
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="grid grid-cols-5 bg-slate-100 p-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <div className="col-span-2 md:col-span-1">Fecha</div>
              <div className="hidden md:block">Proyecto Destino</div>
              <div className="col-span-2 md:col-span-1 text-right md:text-left">Monto</div>
              <div className="hidden md:block">Método de Pago</div>
              <div className="col-span-1 text-right">Estado</div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {donations.map((d) => (
                <div key={d.id} className="grid grid-cols-5 items-center p-4 hover:bg-slate-50 transition-colors group">
                  <div className="col-span-2 md:col-span-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{formatDate(d.fecha_transferencia).split(',')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{formatDate(d.fecha_transferencia).split(',')[1]}</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-slate-900">{d.proyecto_destino}</p>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1 text-right md:text-left">
                    <p className="text-sm font-black text-slate-900">{formatMoney(d.monto, d.moneda)}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase md:hidden">{d.proyecto_destino}</p>
                  </div>
                  
                  <div className="hidden md:block">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <CreditCard className="w-3 h-3" />
                      {d.metodo_pago}
                    </span>
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    {d.estado === 'pendiente' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        <span className="hidden md:inline">Pendiente</span>
                      </span>
                    )}
                    {d.estado === 'confirmada' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="hidden md:inline">Confirmada</span>
                      </span>
                    )}
                    {d.estado === 'rechazada' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                        <XCircle className="w-3 h-3" />
                        <span className="hidden md:inline">Rechazada</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
