"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { completarOnboardingExalumno } from '@/actions/exalumnos';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { AREAS_INTERES, SECTORES_INDUSTRIA } from '@/constants/catalogs';

const exalumnoSchema = z.object({
  empresa_actual: z.string().optional(),
  cargo_actual: z.string().optional(),
  sector_industria: z.string().optional(),
  anos_experiencia: z.number().min(0).max(60).optional().or(z.literal(0)),
  pais_ciudad: z.string().optional(),
  linkedin_url: z.string().url("Debe ser un enlace válido").optional().or(z.literal('')),
  
  areas_de_interes: z.array(z.string()).min(1, "Selecciona al menos un área"),
  
  ofrece_mentoria: z.boolean(),
  horas_mes_mentoria: z.number().min(0).max(100).optional().or(z.literal(0)),
  ofrece_empleo: z.boolean(),
  ofrece_pasantia: z.boolean(),
  ofrece_proyecto: z.boolean(),
  ofrece_donacion_dinero: z.boolean(),
  monto_maximo_donacion: z.number().min(0).optional().or(z.literal(0)),
  moneda_donacion: z.string().optional(),
  
  bio: z.string().max(1000).optional(),
  habilidadesText: z.string().optional(),
  foto_url: z.string().optional()
});

type ExalumnoFormData = z.infer<typeof exalumnoSchema>;

const defaultFormData: ExalumnoFormData = {
  empresa_actual: '',
  cargo_actual: '',
  sector_industria: '',
  anos_experiencia: 0,
  pais_ciudad: '',
  linkedin_url: '',
  areas_de_interes: [],
  ofrece_mentoria: false,
  horas_mes_mentoria: 0,
  ofrece_empleo: false,
  ofrece_pasantia: false,
  ofrece_proyecto: false,
  ofrece_donacion_dinero: false,
  monto_maximo_donacion: 0,
  moneda_donacion: 'USD',
  bio: '',
  habilidadesText: '',
  foto_url: ''
};

export default function ExalumnoOnboardingForm({ 
  isEditMode = false, 
  initialData, 
  userName, 
  userEmail 
}: { 
  isEditMode?: boolean, 
  initialData?: any, 
  userName?: string, 
  userEmail?: string 
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ExalumnoFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  React.useEffect(() => {
    if (isEditMode && initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        habilidadesText: initialData.habilidades?.join(', ') || ''
      }));
    }
  }, [isEditMode, initialData]);

  const [isUploading, setIsUploading] = useState(false);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErrors(p => ({ ...p, foto: 'Máx 2MB permitido.' })); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setErrors(p => ({ ...p, foto: 'Solo JPG, PNG o WEBP.' })); return; }
    setErrors(p => ({ ...p, foto: '' }));
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { uploadFileAction } = await import('@/actions/storage');
      const result = await uploadFileAction(formData, 'avatars', 'profiles');
      if (result.success) {
        setFormData(prev => ({ ...prev, foto_url: result.path }));
      }
    } catch (err: any) {
      setErrors(p => ({ ...p, foto: err.message || 'Error al subir imagen.' }));
    } finally {
      setIsUploading(false);
    }
  };


  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setIsSubmitting(true);

    try {
      const validData = exalumnoSchema.parse(formData);

      const habilidadesArray = validData.habilidadesText
        ? validData.habilidadesText.split(',').map(h => h.trim()).filter(h => h.length > 0)
        : [];

      const result = await completarOnboardingExalumno({
        empresa_actual: validData.empresa_actual,
        cargo_actual: validData.cargo_actual,
        sector_industria: validData.sector_industria,
        anos_experiencia: validData.anos_experiencia,
        pais_ciudad: validData.pais_ciudad,
        linkedin_url: validData.linkedin_url,
        areas_de_interes: validData.areas_de_interes,
        ofrece_mentoria: validData.ofrece_mentoria,
        horas_mes_mentoria: validData.horas_mes_mentoria,
        ofrece_empleo: validData.ofrece_empleo,
        ofrece_pasantia: validData.ofrece_pasantia,
        ofrece_proyecto: validData.ofrece_proyecto,
        ofrece_donacion_dinero: validData.ofrece_donacion_dinero,
        monto_maximo_donacion: validData.monto_maximo_donacion,
        moneda_donacion: validData.moneda_donacion,
        bio: validData.bio,
        habilidades: habilidadesArray,
        foto_url: validData.foto_url,
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al guardar el perfil');
      }

      router.push('/dashboard');
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        let firstErrorStep = 5;
        
        const stepMapping: Record<string, number> = {
          foto_url: 1, bio: 1,
          empresa_actual: 2, cargo_actual: 2, sector_industria: 2, anos_experiencia: 2, pais_ciudad: 2, linkedin_url: 2,
          areas_de_interes: 3,
          ofrece_mentoria: 4, horas_mes_mentoria: 4, ofrece_empleo: 4, ofrece_pasantia: 4, ofrece_proyecto: 4, ofrece_donacion_dinero: 4,
          habilidadesText: 5
        };

        err.errors.forEach(e => {
          if (e.path[0]) {
            const field = e.path[0].toString();
            newErrors[field] = e.message;
            if (stepMapping[field] && stepMapping[field] < firstErrorStep) {
              firstErrorStep = stepMapping[field];
            }
          }
        });
        
        setErrors(newErrors);
        setStep(firstErrorStep);
        setGlobalError(`Por favor revisa los campos en rojo (Paso ${firstErrorStep}).`);
      } else {
        setGlobalError(err.message || 'Error al guardar el perfil.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6">
        <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Paso {step} de 5</span>
          <span>{Math.round((step / 5) * 100)}% Completado</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-naranja h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>
      </div>

      <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="p-6 sm:p-8">
        
        
        {/* --- STEP 1: Información Personal --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 1: Información Personal y Biografía</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input type="text" value={userName || 'No disponible'} disabled
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input type="text" value={userEmail || 'No disponible'} disabled
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Foto de Perfil <span className="text-slate-400 font-normal">(opcional, máx. 2MB)</span></label>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300 overflow-hidden shrink-0">
                  {formData.foto_url
                    ? <img src={formData.foto_url.startsWith('http') ? formData.foto_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/avatars/${formData.foto_url}`} alt="Preview" className="w-full h-full object-cover" />
                    : <span className="text-slate-400">Sin foto</span>
                  }
                </div>
                <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-naranja text-xs font-bold text-slate-500 hover:text-naranja transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUploading ? 'Subiendo...' : 'Subir foto'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} disabled={isUploading} />
                </label>
              </div>
              {errors.foto && <p className="text-red-500 text-xs mt-1">{errors.foto}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Biografía / Acerca de mí</label>
              <p className="text-xs text-slate-500 mb-2">Cuéntale a la comunidad un poco sobre tu trayectoria y qué buscas aportar.</p>
              <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={4} maxLength={1000}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-naranja/50 outline-none resize-none"
                placeholder="Soy egresado de... Actualmente trabajo en... Me apasiona..." />
              <p className="text-xs text-slate-500 mt-1 text-right">{(formData.bio || '').length}/1000</p>
            </div>
          </div>
        )}
  
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2 rounded-md">
            <AlertCircle size={20} />
            <p>{globalError}</p>
          </div>
        )}

        {/* --- STEP 1: Información Profesional --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 1: Información Profesional</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa Actual</label>
                <input type="text" name="empresa_actual" value={formData.empresa_actual} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-naranja/50 outline-none"
                  placeholder="Ej: Intel, BAC, UCR..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Puesto</label>
                <input type="text" name="cargo_actual" value={formData.cargo_actual} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-naranja/50 outline-none"
                  placeholder="Ej: Desarrollador, Gerente..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sector o Industria</label>
                <div className="relative">
                  <select name="sector_industria" value={formData.sector_industria} onChange={handleChange}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-naranja focus:ring-1 focus:ring-naranja/50 outline-none bg-white appearance-none">
                    <option value="">Seleccione una industria...</option>
                    {SECTORES_INDUSTRIA.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Años de Experiencia Laboral</label>
                <input type="number" name="anos_experiencia" value={formData.anos_experiencia || ''} onChange={handleChange} min="0" max="60"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-naranja/50 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">País y Ciudad</label>
                <input type="text" name="pais_ciudad" value={formData.pais_ciudad} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-naranja/50 outline-none"
                  placeholder="Ej: San José, Costa Rica" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enlace a LinkedIn</label>
                <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange}
                  className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-naranja/50 outline-none transition-shadow ${errors.linkedin_url ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="https://linkedin.com/in/tu-perfil" />
                {errors.linkedin_url && <p className="text-red-500 text-xs mt-1">{errors.linkedin_url}</p>}
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: Áreas de Interés --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 2: Áreas de Interés</h2>
            
            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <strong>Nota:</strong> Selecciona las áreas temáticas de tu interés. 
              Este campo es fundamental para el algoritmo de <em>matching</em> con estudiantes y proyectos.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Área de interés principal *</label>
              <div className="relative">
                <select 
                  value={formData.areas_de_interes[0] || ''} 
                  onChange={e => setFormData(prev => ({ ...prev, areas_de_interes: e.target.value ? [e.target.value] : [] }))}
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-naranja focus:ring-1 focus:ring-naranja/50 outline-none bg-white appearance-none"
                >
                  <option value="">Seleccione un área...</option>
                  {AREAS_INTERES.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              {errors.areas_de_interes && <p className="text-red-500 text-xs mt-2">{errors.areas_de_interes}</p>}
            </div>
          </div>
        )}

        {/* --- STEP 3: Tipos de Apoyo (Give Back) --- */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 3: Formas de Apoyo a la Comunidad</h2>
            
            <p className="text-sm text-slate-600 mb-4">
              ¿Cómo te gustaría involucrarte y apoyar a los estudiantes actuales de la UCR? Marca las opciones que apliquen.
            </p>

            <div className="space-y-4">
              {[
                { name: 'ofrece_mentoria', label: 'Mentoría Técnica o Profesional' },
                { name: 'ofrece_empleo', label: 'Oportunidades de Empleo' },
                { name: 'ofrece_pasantia', label: 'Pasantías / Prácticas' },
                { name: 'ofrece_proyecto', label: 'Colaboración en Proyectos de Graduación' },
                { name: 'ofrece_donacion_dinero', label: 'Apoyo Económico (Donaciones a proyectos)' },
              ].map(item => (
                <div key={item.name} className={`rounded-lg border p-4 transition-colors ${formData[item.name as keyof ExalumnoFormData] ? 'border-naranja/40 bg-naranja/10/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-slate-800">{item.label}</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name={item.name} id={item.name} checked={formData[item.name as keyof ExalumnoFormData] as boolean} onChange={handleChange} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                      <label htmlFor={item.name} className={`toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer ${formData[item.name as keyof ExalumnoFormData] ? 'bg-naranja/100' : ''}`}></label>
                    </div>
                  </label>

                  {/* Campos condicionales para Mentoría */}
                  {item.name === 'ofrece_mentoria' && formData.ofrece_mentoria && (
                    <div className="mt-4 pl-2 animate-in slide-in-from-top-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Horas al mes disponibles para mentoría</label>
                      <input type="number" name="horas_mes_mentoria" value={formData.horas_mes_mentoria || ''} onChange={handleChange} min="1" max="100"
                        className="w-32 p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-naranja/50 outline-none" placeholder="Ej: 5" />
                    </div>
                  )}

                  {/* Campos condicionales para Donación */}
                  {item.name === 'ofrece_donacion_dinero' && formData.ofrece_donacion_dinero && (
                    <div className="mt-4 pl-2 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 max-w-xs">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Monto máximo estimado</label>
                        <input type="number" name="monto_maximo_donacion" value={formData.monto_maximo_donacion || ''} onChange={handleChange} min="0"
                          className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-naranja/50 outline-none" placeholder="Ej: 500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Moneda</label>
                        <select name="moneda_donacion" value={formData.moneda_donacion} onChange={handleChange}
                          className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-naranja/50 outline-none bg-white">
                          <option value="USD">USD</option>
                          <option value="CRC">CRC</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Minimal CSS for toggle switches */}
            <style jsx>{`
              .toggle-checkbox:checked { right: 0; border-color: #F34B26; }
              .toggle-checkbox:checked + .toggle-label { background-color: #F34B26; }
              .toggle-checkbox { right: 1.25rem; z-index: 1; border-color: #cbd5e1; transition: all 0.3s; }
            `}</style>
          </div>
        )}

        {/* --- STEP 4: Acerca de mí y Habilidades --- */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 4: Acerca de mí y Habilidades</h2>
            
            

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Habilidades Profesionales y Técnicas</label>
              <p className="text-xs text-slate-500 mb-3">Escribe tus habilidades separadas por comas (Ej: Liderazgo de equipos, Python, Negociación, Diseño UX). Fundamental para hacer match.</p>
              <textarea name="habilidadesText" value={formData.habilidadesText} onChange={handleChange} rows={3}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-naranja/50 outline-none resize-none"
                placeholder="Python, Excel, Liderazgo, Agile..." />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-start gap-4 mt-6">
              <CheckCircle2 className="text-green-600 mt-0.5" size={24} />
              <div>
                <h3 className="font-semibold text-green-800">¡Todo listo para conectar!</h3>
                <p className="text-sm text-green-700 mt-1">Al guardar tu perfil estarás visible en el directorio para que estudiantes puedan encontrar oportunidades de mentoría y apoyo gracias a tus aportes.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- Navigation --- */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
          <button type="button" onClick={handlePrev} disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-2.5 font-bold uppercase text-xs transition-colors ${step === 1 ? 'invisible' : 'text-slate-600 hover:text-slate-900'}`}>
            <ArrowLeft size={16} /> Anterior
          </button>
          
          <button type="submit" disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white transition-all shadow-sm ${isSubmitting ? 'bg-naranja/50 cursor-not-allowed' : 'bg-naranja hover:opacity-90 hover:shadow'}`}>
            {isSubmitting ? 'Guardando...' : (step === 5 ? (isEditMode ? 'Guardar Cambios' : 'Completar Perfil') : 'Siguiente')}
            {step < 5 && <ArrowRight size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
