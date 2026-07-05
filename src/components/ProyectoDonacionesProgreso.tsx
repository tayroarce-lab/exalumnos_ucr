'use client';

import React, { useEffect, useState } from 'react';
import { obtenerProgresoDonacionesProyecto } from '@/actions/donations';
import { GraduationCap, Heart, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  proyectoId: string;
  metaMonto: number | null;
  metaMoneda: string | null;
  mostrarBotonApoyar?: boolean;
  variant?: 'default' | 'compact';
}

export default function ProyectoDonacionesProgreso({
  proyectoId,
  metaMonto,
  metaMoneda = 'USD',
  mostrarBotonApoyar = false,
  variant = 'default',
}: Props) {
  const [progreso, setProgreso] = useState<{ totalAcumulado: number; porcentaje: number; donantesUnicos: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proyectoId || !metaMonto) {
      setLoading(false);
      return;
    }

    obtenerProgresoDonacionesProyecto(proyectoId, metaMonto, metaMoneda)
      .then((data) => {
        setProgreso(data);
      })
      .catch((err) => {
        console.error('Error fetching project funding progress:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [proyectoId, metaMonto, metaMoneda]);

  if (loading) {
    if (variant === 'compact') {
      return (
        <div className="space-y-2 animate-pulse mt-2">
          <div className="h-2 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 w-full rounded" />
        </div>
      );
    }
    return (
      <div className="space-y-2 animate-pulse bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 w-full rounded" />
      </div>
    );
  }

  if (!metaMonto || !progreso) {
    return null;
  }

  const symbol = metaMoneda === 'USD' ? '$' : '';
  const formatMonto = (monto: number) => {
    return monto.toLocaleString('es-CR', {
      maximumFractionDigits: metaMoneda === 'USD' ? 2 : 0,
      minimumFractionDigits: 0
    });
  };

  if (variant === 'compact') {
    return (
      <div className="space-y-2 pt-1 w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Heart className="w-2.5 h-2.5 text-slate-400" /> Donaciones
          </span>
          <span className="text-[11px] font-bold text-slate-900">{progreso.porcentaje}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full rounded-full bg-slate-900 transition-all duration-1000 ease-out" 
            style={{ width: `${progreso.porcentaje}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
          <span>{symbol}{formatMonto(progreso.totalAcumulado)} rec.</span>
          <span>Meta: {symbol}{formatMonto(metaMonto)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden transition-all">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
            <Heart className="w-3 h-3 text-slate-400" /> Financiamiento Colectivo
          </span>
          <h4 className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-2">
            Meta de Financiamiento: <span className="font-black text-slate-900">{symbol}{formatMonto(metaMonto)} {metaMoneda}</span>
          </h4>
        </div>

        {progreso.porcentaje > 0 && (
          <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm select-none self-start sm:self-center">
            {progreso.porcentaje}% Completado
          </span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-2">
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full rounded-full bg-slate-900 transition-all duration-1000 ease-out" 
            style={{ width: `${progreso.porcentaje}%` }}
          />
        </div>

        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>{symbol}{formatMonto(progreso.totalAcumulado)} recaudado</span>
          <span>{progreso.porcentaje}%</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-xs text-slate-500 font-medium">
          {progreso.donantesUnicos > 0 ? (
            <>Apoyado por <span className="font-bold text-slate-700">{progreso.donantesUnicos} {progreso.donantesUnicos === 1 ? 'persona' : 'personas'}</span> con donaciones confirmadas.</>
          ) : (
            'Aún no hay donaciones registradas. ¡Sé el primero en apoyar!'
          )}
        </p>

        {mostrarBotonApoyar && (
          <Link href={`/donations?proyecto_id=${proyectoId}`} className="shrink-0">
            <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">
              <GraduationCap className="w-4 h-4" />
              Apoyar este Proyecto
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
