'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { certificationSchema, CertificationData } from '@/app/actions/cv/schemas';
import { upsertCertification, deleteCertification } from '@/app/actions/cv/certification.actions';
import { SaveState } from '../SaveIndicator';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  initialData?: CertificationData[];
  onSaveStateChange: (state: SaveState, message?: string) => void;
}

function CertificationItem({ 
  data, 
  onSaveStateChange, 
  onDelete 
}: { 
  data: CertificationData; 
  onSaveStateChange: (s: SaveState, m?: string) => void;
  onDelete: (id?: string) => void;
}) {
  const { register, watch, formState: { errors } } = useForm<CertificationData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: data
  });

  const formData = watch();

  const saveData = useCallback(async (formDataToSave: CertificationData) => {
    onSaveStateChange('saving');
    try {
      const res = await upsertCertification(formDataToSave);
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
      const result = certificationSchema.safeParse(formData);
      if (result.success) {
        saveData(result.data);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, saveData]);

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-slate-900 shadow-sm relative">
      <button 
        type="button" 
        onClick={() => onDelete(data.id)}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-900 rounded-md z-10"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
        <div className="space-y-2">
          <label className="text-xs font-medium">Nombre de Certificación/Logro <span className="text-red-500">*</span></label>
          <input {...register('name')} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Institución emisora <span className="text-red-500">*</span></label>
          <input {...register('institution')} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" />
          {errors.institution && <p className="text-xs text-red-500">{errors.institution.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-xs font-medium">Mes de emisión</label>
            <input type="number" {...register('issued_month', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseInt(v) })} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" placeholder="MM" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Año de emisión</label>
            <input type="number" {...register('issued_year', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseInt(v) })} className="flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-transparent" placeholder="YYYY" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">URL de verificación</label>
          <div className="relative">
            <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input {...register('verification_url')} type="url" className="flex h-9 w-full rounded-md border pl-9 pr-3 py-1 text-sm bg-transparent" placeholder="https://" />
          </div>
          {errors.verification_url && <p className="text-xs text-red-500">{errors.verification_url.message}</p>}
        </div>
      </div>
    </div>
  );
}

export function CertificationsForm({ initialData = [], onSaveStateChange }: Props) {
  const [certifications, setCertifications] = useState<CertificationData[]>(initialData);
  const { toast } = useToast();

  const handleAdd = () => {
    setCertifications([...certifications, {
      name: '',
      institution: '',
      issued_year: new Date().getFullYear(),
      issued_month: new Date().getMonth() + 1
    }]);
  };

  const handleDelete = async (index: number, id?: string) => {
    if (id) {
      onSaveStateChange('saving');
      const res = await deleteCertification(id);
      if (res.success) {
        onSaveStateChange('saved');
        toast({ title: "Certificación eliminada" });
      } else {
        onSaveStateChange('error', res.message);
        toast({ title: "Error", description: res.message, variant: "destructive" });
        return;
      }
    }
    
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {certifications.length === 0 && (
        <div className="text-center py-10 text-slate-500 border-2 border-dashed rounded-lg">
          No tienes certificaciones registradas aún.
        </div>
      )}

      <div className="space-y-4">
        {certifications.map((cert, index) => (
          <CertificationItem 
            key={cert.id || `new-${index}`}
            data={cert}
            onSaveStateChange={onSaveStateChange}
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
        Agregar Certificación
      </button>
    </div>
  );
}
