'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { certificationSchema, CertificationData } from '@/app/actions/cv/schemas';
import { upsertCertification, deleteCertification } from '@/app/actions/cv/certification.actions';
import { SaveState } from '../SaveIndicator';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCVLive } from '../CVLiveContext';

interface Props {
  initialData?: CertificationData[];
  onSaveStateChange: (state: SaveState, message?: string) => void;
}

function CertificationItem({ 
  data, 
  onSaveStateChange, 
  onDelete,
  index 
}: { 
  data: CertificationData; 
  onSaveStateChange: (s: SaveState, m?: string) => void;
  onDelete: (id?: string) => void;
  index: number;
}) {
  const { register, watch, setValue, formState: { errors } } = useForm<CertificationData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: data
  });

  const formData = watch();
  const { updateCertification } = useCVLive();

  useEffect(() => {
    updateCertification(index, formData);
  }, [formData, updateCertification, index]);

  const saveData = useCallback(async (formDataToSave: CertificationData) => {
    onSaveStateChange('saving');
    try {
      const res = await upsertCertification(formDataToSave);
      if (res.success) {
        onSaveStateChange('saved');
        if (res.data?.id && !formDataToSave.id) {
          setValue('id', res.data.id);
        }
      } else {
        onSaveStateChange('error', res.message);
      }
    } catch (e) {
      onSaveStateChange('error', 'Error de red');
    }
  }, [onSaveStateChange, setValue]);

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
    <div className="border border-slate-300 rounded-2xl p-5 bg-blanco shadow-sm relative transition-all duration-300 hover:shadow-md font-sans">
      <button 
        type="button" 
        onClick={() => onDelete(formData.id || data.id)}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-naranja bg-transparent hover:bg-naranja/10 rounded-xl transition-all z-10"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-10">
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Nombre de Certificación/Logro <span className="text-naranja">*</span></label>
          <input {...register('name')} className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400" />
          {errors.name && <p className="text-xs text-naranja">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Institución emisora <span className="text-naranja">*</span></label>
          <input {...register('institution')} className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400" />
          {errors.institution && <p className="text-xs text-naranja">{errors.institution.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Mes de emisión</label>
            <input type="number" {...register('issued_month', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseInt(v) })} className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400" placeholder="MM" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">Año de emisión</label>
            <input type="number" {...register('issued_year', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseInt(v) })} className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400" placeholder="YYYY" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wide uppercase text-slate-500 mb-1.5 block">URL de verificación</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input {...register('verification_url')} type="url" className="flex min-h-[44px] w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-negro-base shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 focus-visible:border-celeste placeholder:text-slate-400" placeholder="https://" />
          </div>
          {errors.verification_url && <p className="text-xs text-naranja">{errors.verification_url.message}</p>}
        </div>
      </div>
    </div>
  );
}

export function CertificationsForm({ initialData = [], onSaveStateChange }: Props) {
  const [certifications, setCertifications] = useState<CertificationData[]>(initialData);
  const { toast } = useToast();
  const { removeCertification } = useCVLive();

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
    removeCertification(index);
  };

  return (
    <div className="space-y-8 font-sans">
      {certifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-200 flex items-center justify-center">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-lg font-medium">No tienes certificaciones registradas aún.</p>
          <p className="text-sm mt-1">Añade tus logros y certificaciones.</p>
        </div>
      )}

      <div className="space-y-6">
        {certifications.map((cert, index) => (
          <CertificationItem 
            key={cert.id || `new-${index}`}
            data={cert}
            onSaveStateChange={onSaveStateChange}
            onDelete={(id) => handleDelete(index, id)}
            index={index}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full inline-flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-transparent hover:bg-slate-50 py-5 text-sm font-bold text-slate-600 hover:border-celeste hover:text-celeste transition-all duration-300 group"
      >
        <div className="flex items-center justify-center bg-white rounded-full w-8 h-8 mr-3 shadow-sm group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5" />
        </div>
        Agregar Certificación
      </button>
    </div>
  );
}
