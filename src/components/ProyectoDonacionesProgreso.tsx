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
}

export default function ProyectoDonacionesProgreso({
  proyectoId,
  metaMonto,
  metaMoneda = 'USD',
  mostrarBotonApoyar = false,
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

  const symbol = metaMoneda === 'USD' ? '$' : '₡';
  const formatMonto = (monto: number) => {
    return monto.toLocaleString('es-CR', {
      maximumFractionDigits: metaMoneda === 'USD' ? 2 : 0,
      minimumFractionDigits: 0
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/40 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-celeste/5 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black text-celeste uppercase tracking-wider bg-celeste/10 px-2 py-0.5 rounded-lg flex items-center gap-1.5 w-fit">
            <Heart className="w-3 h-3 fill-celeste" /> Financiamiento Colectivo
          </span>
          <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            Meta de Financiamiento: <span className="font-black text-slate-900 dark:text-white">{symbol}{formatMonto(metaMonto)} {metaMoneda}</span>
          </h4>
        </div>

        {progreso.porcentaje > 0 && (
          <span className="text-sm font-black text-celeste bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 px-3 py-1 rounded-xl shadow-sm select-none self-start sm:self-center">
            {progreso.porcentaje}% Completado
          </span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-2">
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/30">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-celeste via-[#38bdf8] to-[#FF9B18] transition-all duration-1000 ease-out shadow-inner" 
            style={{ width: `${progreso.porcentaje}%` }}
          />
        </div>

        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>{symbol}{formatMonto(progreso.totalAcumulado)} recaudado</span>
          <span>{progreso.porcentaje}%</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {progreso.donantesUnicos > 0 ? (
            <>Apoyado por <span className="font-extrabold text-slate-600 dark:text-slate-300">{progreso.donantesUnicos} {progreso.donantesUnicos === 1 ? 'exalumno' : 'exalumnos'}</span> con donaciones confirmadas.</>
          ) : (
            'Aún no hay donaciones registradas. ¡Sé el primero en apoyar!'
          )}
        </p>

        {mostrarBotonApoyar && (
          <Link href={`/donations?proyecto_id=${proyectoId}`} className="shrink-0">
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF9B18] to-[#F34B26] hover:from-[#e08610] hover:to-[#d03d1e] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-orange-950/10 hover:shadow-lg active:scale-95 group">
              <GraduationCap className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Apoyar este Proyecto
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
