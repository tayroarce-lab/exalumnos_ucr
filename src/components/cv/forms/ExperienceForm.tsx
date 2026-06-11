'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { experienceSchema, ExperienceData } from '@/app/actions/cv/schemas';
import { upsertExperience, deleteExperience } from '@/app/actions/cv/experience.actions';
import { SaveState } from '../SaveIndicator';
import { BulletInput } from '../ui/BulletInput';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  initialData?: ExperienceData[];
  onSaveStateChange: (state: SaveState, message?: string) => void;
  flushSignal: number;
}

// Sub-componente para cada experiencia
function ExperienceItem({ 
  data, 
  onSaveStateChange, 
  flushSignal, 
  onDelete 
}: { 
  data: ExperienceData; 
  onSaveStateChange: (s: SaveState, m?: string) => void;
  flushSignal: number;
  onDelete: (id?: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(!data.id);
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ExperienceData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: data
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "bullets" as never, // react-hook-form workaround for string arrays
  });

  const formData = watch();

  const saveData = useCallback(async (formDataToSave: ExperienceData) => {
    onSaveStateChange('saving');
    try {
      const res = await upsertExperience(formDataToSave);
      if (res.success) {
        onSaveStateChange('saved');
      } else {
        onSaveStateChange('error', res.message);
      }
    } catch (e) {
      onSaveStateChange('error', 'Error de red');
    }
  }, [onSaveStateChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = experienceSchema.safeParse(formData);
      if (result.success) {
        saveData(result.data);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, saveData]);

  useEffect(() => {
    if (flushSignal > 0) {
      const result = experienceSchema.safeParse(formData);
      if (result.success) {
        saveData(result.data);
      }
    }
  }, [flushSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  const bullets = formData.bullets || [];

  return (
    <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl p-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm relative transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h4 className="font-bold text-lg text-slate-900 dark:text-white">{formData.title || '(Sin título)'}</h4>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{formData.organization || 'Organización'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
            className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="p-2 text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-black/20 rounded-xl">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6 border-t border-slate-200/60 dark:border-white/10 pt-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">Tipo <span className="text-red-500">*</span></label>
              <select {...register('experience_type')} className="flex min-h-[44px] w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-slate-900 backdrop-blur-md px-4 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500">
                <option value="Empleo">Empleo</option>
                <option value="Voluntariado">Voluntariado</option>
                <option value="Proyecto universitario">Proyecto Universitario</option>
                <option value="Asistencia">Asistencia</option>
                <option value="Investigación">Investigación</option>
              </select>
              {errors.experience_type && <p className="text-xs text-red-500">{errors.experience_type.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">Título/Rol <span className="text-red-500">*</span></label>
              <input {...register('title')} className="flex min-h-[44px] w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 placeholder:text-slate-400" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">Organización <span className="text-red-500">*</span></label>
              <input {...register('organization')} className="flex min-h-[44px] w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 placeholder:text-slate-400" />
              {errors.organization && <p className="text-xs text-red-500">{errors.organization.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">Mes Inicio <span className="text-red-500">*</span></label>
                <input type="number" {...register('start_month', { valueAsNumber: true })} className="flex min-h-[44px] w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 placeholder:text-slate-400" placeholder="MM" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">Año Inicio <span className="text-red-500">*</span></label>
                <input type="number" {...register('start_year', { valueAsNumber: true })} className="flex min-h-[44px] w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 placeholder:text-slate-400" placeholder="YYYY" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">Mes Fin</label>
                <input type="number" {...register('end_month', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseInt(v) })} className="flex min-h-[44px] w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 placeholder:text-slate-400" placeholder="MM (Vacío = Actual)" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">Año Fin</label>
                <input type="number" {...register('end_year', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseInt(v) })} className="flex min-h-[44px] w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 placeholder:text-slate-400" placeholder="YYYY (Vacío = Actual)" />
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400">Viñetas de Logros (Máx 5)</label>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md">{bullets.length} / 5</span>
            </div>
            
            {/* Como react-hook-form useFieldArray con array primitivo de strings es complicado, lo manejamos controlando el array entero */}
            <div className="space-y-3">
              {bullets.map((bullet, index) => (
                <BulletInput 
                  key={index}
                  value={bullet}
                  onChange={(val) => {
                    const newBullets = [...bullets];
                    newBullets[index] = val;
                    // @ts-ignore
                    update(index, val); 
                  }}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>

            {bullets.length < 5 && (
              <button
                type="button"
                onClick={() => append('' as never)}
                className="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 h-11 px-4 py-2 w-full mt-4"
              >
                <Plus className="w-5 h-5 mr-2" /> Añadir viñeta
              </button>
            )}
            {errors.bullets && <p className="text-xs text-red-500">{errors.bullets.message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function ExperienceForm({ initialData = [], onSaveStateChange, flushSignal }: Props) {
  const [experiences, setExperiences] = useState<ExperienceData[]>(initialData);
  const { toast } = useToast();

  const handleAdd = () => {
    setExperiences([...experiences, {
      experience_type: 'Empleo',
      title: '',
      organization: '',
      start_month: new Date().getMonth() + 1,
      start_year: new Date().getFullYear(),
      bullets: []
    }]);
  };

  const handleDelete = async (index: number, id?: string) => {
    if (id) {
      onSaveStateChange('saving');
      const res = await deleteExperience(id);
      if (res.success) {
        onSaveStateChange('saved');
        toast({ title: "Experiencia eliminada" });
      } else {
        onSaveStateChange('error', res.message);
        toast({ title: "Error", description: res.message, variant: "destructive" });
        return;
      }
    }
    
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {experiences.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            <Plus className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-lg font-medium">No tienes experiencias registradas aún.</p>
          <p className="text-sm mt-1">Añade tu primer empleo o proyecto.</p>
        </div>
      )}

      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <ExperienceItem 
            key={exp.id || `new-${index}`}
            data={exp}
            onSaveStateChange={onSaveStateChange}
            flushSignal={flushSignal}
            onDelete={(id) => handleDelete(index, id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full inline-flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 py-5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 group"
      >
        <div className="flex items-center justify-center bg-white dark:bg-white/10 rounded-full w-8 h-8 mr-3 shadow-sm group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5" />
        </div>
        Agregar Experiencia
      </button>
    </div>
  );
}
