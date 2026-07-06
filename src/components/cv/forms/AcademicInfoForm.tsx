'use client';

import React, { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { academicInfoSchema, AcademicInfoData } from '@/app/actions/cv/schemas';
import { upsertAcademicInfo } from '@/app/actions/cv/academic.actions';
import { SaveState } from '../SaveIndicator';
import { useCVLive } from '../CVLiveContext';

interface Props {
  initialData?: AcademicInfoData;
  onSaveStateChange: (state: SaveState, message?: string) => void;
  flushSignal: number;
}

export function AcademicInfoForm({ initialData, onSaveStateChange, flushSignal }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<AcademicInfoData>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: initialData || {
      university: 'Universidad de Costa Rica',
      career: '',
      academic_level: 'Bachillerato',
      entry_year: new Date().getFullYear(),
      gpa: undefined,
      graduation_project_title: '',
      graduation_project_description: ''
    }
  });

  const formData = watch();
  const { updateAcademic } = useCVLive();

  useEffect(() => {
    updateAcademic(formData);
  }, [formData, updateAcademic]);

  const saveData = useCallback(async (data: AcademicInfoData) => {
    onSaveStateChange('saving');
    try {
      const res = await upsertAcademicInfo(data);
      if (res.success) {
        onSaveStateChange('saved');
      } else {
        onSaveStateChange('error', res.message);
      }
    } catch (e) {
      onSaveStateChange('error', 'Error de red');
    }
  }, [onSaveStateChange]);

  // Autoguardado con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Validar antes de enviar auto-save
      const result = academicInfoSchema.safeParse(formData);
      if (result.success) {
        saveData(result.data);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, saveData]);

  // Guardado forzado al cambiar de paso
  useEffect(() => {
    if (flushSignal > 0) {
      const result = academicInfoSchema.safeParse(formData);
      if (result.success) {
        saveData(result.data);
      }
    }
  }, [flushSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form className="space-y-6 font-sans" onSubmit={(e) => e.preventDefault()}>
      <div className="mb-6">
        <h3 className="text-2xl font-black uppercase font-display text-esmeralda mb-1">Información Básica</h3>
        <p className="text-sm text-slate-500 font-medium">Estos datos son fundamentales para que los reclutadores conozcan tu perfil académico.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Universidad <span className="text-naranja">*</span></label>
          <input 
            {...register('university')}
            className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400"
          />
          {errors.university && <p className="text-[0.8rem] text-naranja">{errors.university.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Carrera <span className="text-naranja">*</span></label>
          <input 
            {...register('career')}
            className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400"
            placeholder="Ej. Ingeniería en Computación"
          />
          {errors.career && <p className="text-[0.8rem] text-naranja">{errors.career.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Nivel Académico <span className="text-naranja">*</span></label>
          <select 
            {...register('academic_level')}
            className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400"
          >
            <option value="Bachillerato">Bachillerato</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Maestría">Maestría</option>
            <option value="Doctorado">Doctorado</option>
          </select>
          {errors.academic_level && <p className="text-[0.8rem] text-naranja">{errors.academic_level.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Año Ingreso <span className="text-naranja">*</span></label>
            <input 
              type="number"
              {...register('entry_year', { valueAsNumber: true })}
              className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400"
            />
            {errors.entry_year && <p className="text-[0.8rem] text-naranja">{errors.entry_year.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Promedio Ponderado</label>
            <input 
              type="number"
              step="0.01"
              {...register('gpa', { setValueAs: v => (v === '' || v === null || v === undefined) ? undefined : Number(v) })}
              className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400"
              placeholder="Ej. 9.5"
            />
            {errors.gpa && <p className="text-[0.8rem] text-naranja">{errors.gpa.message}</p>}
          </div>
        </div>

      </div>

      <div className="border-t border-slate-200 pt-6 mt-6">
        <h3 className="text-2xl font-black uppercase font-display text-esmeralda mb-1">Proyecto de Graduación / TFG</h3>
        <p className="text-sm text-slate-500 font-medium mb-6">Destaca tu TFG, tesis o proyecto de investigación.</p>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Título del Proyecto</label>
            <input 
              {...register('graduation_project_title')}
              className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Breve Descripción</label>
            <textarea 
              {...register('graduation_project_description')}
              rows={3}
              className="flex w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
