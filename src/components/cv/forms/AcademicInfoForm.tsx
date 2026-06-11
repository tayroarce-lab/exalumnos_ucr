'use client';

import React, { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { academicInfoSchema, AcademicInfoData } from '@/app/actions/cv/schemas';
import { upsertAcademicInfo } from '@/app/actions/cv/academic.actions';
import { SaveState } from '../SaveIndicator';

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
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Universidad <span className="text-red-500">*</span></label>
          <input 
            {...register('university')}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
          />
          {errors.university && <p className="text-[0.8rem] text-red-500">{errors.university.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Carrera <span className="text-red-500">*</span></label>
          <input 
            {...register('career')}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
            placeholder="Ej. Ingeniería en Computación"
          />
          {errors.career && <p className="text-[0.8rem] text-red-500">{errors.career.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Nivel Académico <span className="text-red-500">*</span></label>
          <select 
            {...register('academic_level')}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
          >
            <option value="Bachillerato">Bachillerato</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Maestría">Maestría</option>
            <option value="Doctorado">Doctorado</option>
          </select>
          {errors.academic_level && <p className="text-[0.8rem] text-red-500">{errors.academic_level.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Año Ingreso <span className="text-red-500">*</span></label>
            <input 
              type="number"
              {...register('entry_year', { valueAsNumber: true })}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
            />
            {errors.entry_year && <p className="text-[0.8rem] text-red-500">{errors.entry_year.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Promedio Ponderado</label>
            <input 
              type="number"
              step="0.01"
              {...register('gpa', { valueAsNumber: true })}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
              placeholder="Ej. 9.5"
            />
            {errors.gpa && <p className="text-[0.8rem] text-red-500">{errors.gpa.message}</p>}
          </div>
        </div>

      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">Proyecto de Graduación / TFG</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Título del Proyecto</label>
            <input 
              {...register('graduation_project_title')}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Breve Descripción</label>
            <textarea 
              {...register('graduation_project_description')}
              rows={3}
              className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 resize-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
