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
    <div className="border rounded-lg p-4 bg-white dark:bg-slate-900 shadow-sm relative">
      <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h4 className="font-semibold">{formData.title || '(Sin título)'}</h4>
          <p className="text-sm text-slate-500">{formData.organization || 'Organización'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Tipo <span className="text-red-500">*</span></label>
              <select {...register('experience_type')} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent">
                <option value="Empleo">Empleo</option>
                <option value="Voluntariado">Voluntariado</option>
                <option value="Proyecto universitario">Proyecto Universitario</option>
                <option value="Asistencia">Asistencia</option>
                <option value="Investigación">Investigación</option>
              </select>
              {errors.experience_type && <p className="text-xs text-red-500">{errors.experience_type.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Título/Rol <span className="text-red-500">*</span></label>
              <input {...register('title')} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium">Organización <span className="text-red-500">*</span></label>
              <input {...register('organization')} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" />
              {errors.organization && <p className="text-xs text-red-500">{errors.organization.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Mes Inicio <span className="text-red-500">*</span></label>
                <input type="number" {...register('start_month', { valueAsNumber: true })} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" placeholder="MM" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Año Inicio <span className="text-red-500">*</span></label>
                <input type="number" {...register('start_year', { valueAsNumber: true })} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" placeholder="YYYY" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Mes Fin</label>
                <input type="number" {...register('end_month', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseInt(v) })} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" placeholder="MM (Vacío = Actual)" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Año Fin</label>
                <input type="number" {...register('end_year', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseInt(v) })} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" placeholder="YYYY (Vacío = Actual)" />
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Viñetas de Logros (Máx 5)</label>
              <span className="text-xs text-slate-500">{bullets.length} / 5</span>
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
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <Plus className="w-4 h-4 mr-1" /> Añadir viñeta
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
    <div className="space-y-6">
      {experiences.length === 0 && (
        <div className="text-center py-10 text-slate-500 border-2 border-dashed rounded-lg">
          No tienes experiencias registradas aún.
        </div>
      )}

      <div className="space-y-4">
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
        className="w-full inline-flex items-center justify-center rounded-md border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Agregar Experiencia
      </button>
    </div>
  );
}
