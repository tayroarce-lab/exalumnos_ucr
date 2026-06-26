"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { completarOnboardingEstudiante, actualizarPerfilCompletoEstudiante } from '@/actions/students';
import { getProyectoFileUrl } from '@/lib/utils';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { AREAS_INTERES, CARRERAS_UCR, CARRERA_TO_ESCUELA, CARRERA_TO_SEDES } from '@/constants/catalogs';

const studentSchema = z.object({
  carnet_ucr: z.string().min(5, "Formato inválido"),
  carrera: z.string().min(1, "Requerido"),
  escuela_facultad: z.string().min(1, "Requerido"),
  sede: z.string().min(1, "Requerido"),
  anio_ingreso: z.number().min(1950).max(new Date().getFullYear() + 1),
  nivel_academico: z.enum(['bachillerato', 'licenciatura', 'maestria', 'doctorado']),
  promedio_ponderado: z.number().min(0).max(10).optional().or(z.literal(0)),
  beca_socioeconomica: z.enum(['ninguna', 'nivel1', 'nivel2', 'nivel3', 'nivel4', 'nivel5']),
  proyecto_titulo: z.string().min(1, "Requerido").max(200),
  proyecto_descripcion: z.string().min(1, "Requerido").max(1000),
  proyecto_area_tematica: z.string().min(1, "Requerido"),
  proyecto_tipo: z.enum(['tfg', 'tesis', 'practica_dirigida', 'seminario']),
  proyecto_porcentaje_avance: z.number().min(0).max(100),
  proyecto_necesidades: z.array(z.string()).min(1, "Selecciona al menos una necesidad"),
  areas_de_interes: z.array(z.string()).min(1, "Selecciona al menos un área"),
  busca_financiamiento: z.boolean(),
  busca_mentoria: z.boolean(),
  busca_empleo: z.boolean(),
  busca_pasantia: z.boolean(),
  habilidadesText: z.string().optional(),
  hobbiesText: z.string().optional(),
  foto_url: z.string().optional(),
  bio: z.string().max(1000).optional(),
  proyecto_valor_monto: z.number().min(0).optional().or(z.literal(0)),
  proyecto_valor_moneda: z.enum(['CRC', 'USD']).optional(),
  proyecto_video_url: z.string().url("Enlace de video inválido").or(z.literal('')).optional(),
  proyecto_documento_url: z.string().optional(),
  proyecto_foto_url: z.string().optional()
});

type StudentFormData = z.infer<typeof studentSchema>;

const defaultFormData: StudentFormData = {
  carnet_ucr: '',
  carrera: '',
  escuela_facultad: '',
  sede: '',
  anio_ingreso: new Date().getFullYear(),
  nivel_academico: 'bachillerato',
  promedio_ponderado: 0,
  beca_socioeconomica: 'ninguna',
  proyecto_titulo: '',
  proyecto_descripcion: '',
  proyecto_area_tematica: '',
  proyecto_tipo: 'tfg',
  proyecto_porcentaje_avance: 0,
  proyecto_necesidades: [],
  areas_de_interes: [],
  busca_financiamiento: false,
  busca_mentoria: false,
  busca_empleo: false,
  busca_pasantia: false,
  habilidadesText: '',
  hobbiesText: '',
  foto_url: '',
  bio: '',
  proyecto_valor_monto: 0,
  proyecto_valor_moneda: 'CRC',
  proyecto_video_url: '',
  proyecto_documento_url: '',
  proyecto_foto_url: ''
};

const sedes = ['Sede Rodrigo Facio', 'Sede de Occidente', 'Sede del Atlántico', 'Sede de Guanacaste', 'Sede del Pacífico', 'Sede Interuniversitaria de Alajuela', 'Sede del Sur'];
const necesidadesOpciones = ['Financiamiento', 'Mentoría técnica', 'Acceso a datos', 'Infraestructura', 'Validación empresarial', 'Empleo paralelo'];

export default function StudentOnboardingForm({
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
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  React.useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 7) {
        setStep(parsed);
      }
    }
  }, [searchParams]);
  const [formData, setFormData] = useState<StudentFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  React.useEffect(() => {
    if (isEditMode && initialData) {
      setFormData(prev => ({
        ...prev,
        carnet_ucr: initialData.carnet_ucr || '',
        carrera: initialData.carrera || '',
        escuela_facultad: initialData.escuela_facultad || '',
        sede: initialData.sede || '',
        anio_ingreso: initialData.anio_ingreso || new Date().getFullYear(),
        nivel_academico: initialData.nivel_academico || 'bachillerato',
        promedio_ponderado: initialData.promedio_ponderado != null ? Number(initialData.promedio_ponderado) : 0,
        beca_socioeconomica: initialData.beca_socioeconomica || 'ninguna',
        proyecto_titulo: initialData.proyecto_titulo || '',
        proyecto_descripcion: initialData.proyecto_descripcion || '',
        proyecto_area_tematica: initialData.proyecto_area_tematica || '',
        proyecto_tipo: initialData.proyecto_tipo || 'tfg',
        proyecto_porcentaje_avance: initialData.proyecto_porcentaje_avance != null ? Number(initialData.proyecto_porcentaje_avance) : 0,
        proyecto_necesidades: Array.isArray(initialData.proyecto_necesidades) ? initialData.proyecto_necesidades : [],
        areas_de_interes: Array.isArray(initialData.areas_de_interes) ? initialData.areas_de_interes : [],
        busca_financiamiento: !!initialData.busca_financiamiento,
        busca_mentoria: !!initialData.busca_mentoria,
        busca_empleo: !!initialData.busca_empleo,
        busca_pasantia: !!initialData.busca_pasantia,
        foto_url: initialData.foto_url || '',
        bio: initialData.bio || '',
        proyecto_valor_monto: initialData.proyecto_valor_monto != null ? Number(initialData.proyecto_valor_monto) : 0,
        proyecto_valor_moneda: initialData.proyecto_valor_moneda || 'CRC',
        proyecto_video_url: initialData.proyecto_video_url || '',
        proyecto_documento_url: initialData.proyecto_documento_url || '',
        proyecto_foto_url: initialData.proyecto_foto_url || '',
        habilidadesText: initialData.habilidades?.join(', ') || '',
        hobbiesText: Array.isArray(initialData.hobbies) ? initialData.hobbies.join(', ') : (initialData.hobbiesText || '')
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
      const fd = new FormData();
      fd.append('file', file);
      const { uploadFileAction } = await import('@/actions/storage');
      const result = await uploadFileAction(fd, 'avatars', 'profiles');
      if (result.success) {
        setFormData(prev => ({ ...prev, foto_url: result.path }));
      }
    } catch (err: any) {
      setErrors(p => ({ ...p, foto: err.message || 'Error al subir imagen.' }));
    } finally {
      setIsUploading(false);
    }
  };

  const [isDocUploading, setIsDocUploading] = useState(false);
  const handleDocFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { 
      setErrors(p => ({ ...p, documento: 'El archivo excede el tamaño máximo permitido (10MB).' })); 
      return; 
    }
    setErrors(p => ({ ...p, documento: '' }));
    setIsDocUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { uploadFileAction } = await import('@/actions/storage');
      const result = await uploadFileAction(fd, 'proyectos', 'documents');
      if (result.success) {
        setFormData(prev => ({ ...prev, proyecto_documento_url: result.path }));
      }
    } catch (err: any) {
      setErrors(p => ({ ...p, documento: err.message || 'Error al subir documento.' }));
    } finally {
      setIsDocUploading(false);
    }
  };

  const [isProjPhotoUploading, setIsProjPhotoUploading] = useState(false);
  const handleProjPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { 
      setErrors(p => ({ ...p, proyecto_foto: 'La imagen excede el tamaño máximo permitido (5MB).' })); 
      return; 
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { 
      setErrors(p => ({ ...p, proyecto_foto: 'Solo se permiten imágenes JPG, PNG o WEBP.' })); 
      return; 
    }
    setErrors(p => ({ ...p, proyecto_foto: '' }));
    setIsProjPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { uploadFileAction } = await import('@/actions/storage');
      const result = await uploadFileAction(fd, 'proyectos', 'photos');
      if (result.success) {
        setFormData(prev => ({ ...prev, proyecto_foto_url: result.path }));
      }
    } catch (err: any) {
      setErrors(p => ({ ...p, proyecto_foto: err.message || 'Error al subir foto del proyecto.' }));
    } finally {
      setIsProjPhotoUploading(false);
    }
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 7));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'carrera') {
      const autoEscuela = CARRERA_TO_ESCUELA[value] || '';
      setFormData(prev => ({ ...prev, carrera: value, escuela_facultad: autoEscuela, sede: '' }));
      return;
    }
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxArray = (name: 'proyecto_necesidades' | 'areas_de_interes', value: string) => {
    setFormData(prev => {
      const arr = prev[name] as string[];
      if (arr.includes(value)) {
        return { ...prev, [name]: arr.filter(item => item !== value) };
      } else {
        return { ...prev, [name]: [...arr, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setIsSubmitting(true);

    try {
      const validData = studentSchema.parse(formData);

      const habilidadesArray = validData.habilidadesText
        ? validData.habilidadesText.split(',').map(h => h.trim()).filter(h => h.length > 0)
        : [];

      const hobbiesArray = validData.hobbiesText
        ? validData.hobbiesText.split(',').map(h => h.trim()).filter(h => h.length > 0)
        : [];

      let result;
      if (isEditMode) {
        result = await actualizarPerfilCompletoEstudiante({
          full_name: userName,
          foto_url: validData.foto_url,
          bio: validData.bio,
          busca_mentoria: validData.busca_mentoria,
          busca_empleo: validData.busca_empleo,
          busca_pasantia: validData.busca_pasantia,
          carnet_ucr: validData.carnet_ucr,
          beca_socioeconomica: validData.beca_socioeconomica,
          nivel_academico: validData.nivel_academico,
          promedio_ponderado: validData.promedio_ponderado === 0 ? null : validData.promedio_ponderado,
          carrera: validData.carrera,
          escuela_facultad: validData.escuela_facultad,
          sede: validData.sede,
          anio_ingreso: validData.anio_ingreso,
          proyecto_titulo: validData.proyecto_titulo,
          proyecto_descripcion: validData.proyecto_descripcion,
          proyecto_area_tematica: validData.proyecto_area_tematica,
          proyecto_tipo: validData.proyecto_tipo,
          proyecto_porcentaje_avance: validData.proyecto_porcentaje_avance,
          proyecto_valor_monto: validData.proyecto_valor_monto,
          proyecto_valor_moneda: validData.proyecto_valor_moneda,
          proyecto_video_url: validData.proyecto_video_url,
          proyecto_documento_url: validData.proyecto_documento_url,
          proyecto_foto_url: validData.proyecto_foto_url,
          proyecto_necesidades: validData.proyecto_necesidades,
          areas_de_interes: validData.areas_de_interes,
          busca_financiamiento: validData.busca_financiamiento,
          habilidades: habilidadesArray,
          hobbies: hobbiesArray
        });
      } else {
        result = await completarOnboardingEstudiante({
          carnet_ucr: validData.carnet_ucr,
          carrera: validData.carrera,
          escuela_facultad: validData.escuela_facultad,
          sede: validData.sede,
          anio_ingreso: validData.anio_ingreso,
          nivel_academico: validData.nivel_academico,
          promedio_ponderado: validData.promedio_ponderado === 0 ? null : validData.promedio_ponderado,
          beca_socioeconomica: validData.beca_socioeconomica,
          proyecto_titulo: validData.proyecto_titulo,
          proyecto_descripcion: validData.proyecto_descripcion,
          proyecto_area_tematica: validData.proyecto_area_tematica,
          proyecto_tipo: validData.proyecto_tipo,
          proyecto_porcentaje_avance: validData.proyecto_porcentaje_avance,
          proyecto_necesidades: validData.proyecto_necesidades,
          areas_de_interes: validData.areas_de_interes,
          busca_financiamiento: validData.busca_financiamiento,
          busca_mentoria: validData.busca_mentoria,
          busca_empleo: validData.busca_empleo,
          busca_pasantia: validData.busca_pasantia,
          habilidades: habilidadesArray,
          hobbies: hobbiesArray,
          foto_url: validData.foto_url,
          bio: validData.bio,
          proyecto_valor_monto: validData.proyecto_valor_monto,
          proyecto_valor_moneda: validData.proyecto_valor_moneda,
          proyecto_video_url: validData.proyecto_video_url,
          proyecto_documento_url: validData.proyecto_documento_url,
          proyecto_foto_url: validData.proyecto_foto_url
        });
      }

      if (!result.success) {
        throw new Error(result.error || 'Error al guardar el perfil');
      }

      if (isEditMode) {
        router.push('/profile');
      } else {
        router.push('/student-dashboard');
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        let firstErrorStep = 7;
        const stepMapping: Record<string, number> = {
          foto_url: 1, bio: 1,
          carnet_ucr: 2, carrera: 2, escuela_facultad: 2, sede: 2, anio_ingreso: 2, nivel_academico: 2, promedio_ponderado: 2,
          beca_socioeconomica: 3,
          proyecto_titulo: 4, proyecto_descripcion: 4, proyecto_area_tematica: 4, proyecto_tipo: 4, proyecto_porcentaje_avance: 4, proyecto_necesidades: 4,
          proyecto_valor_monto: 4, proyecto_valor_moneda: 4, proyecto_video_url: 4, proyecto_documento_url: 4, proyecto_foto_url: 4, busca_financiamiento: 4,
          areas_de_interes: 5,
          busca_mentoria: 6, busca_empleo: 6, busca_pasantia: 6,
          habilidadesText: 7, hobbiesText: 7
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
          <span>Paso {step} de 7</span>
          <span>{Math.round((step / 7) * 100)}% Completado</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-celeste h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 7) * 100}%` }}></div>
        </div>
      </div>

      <form onSubmit={step === 7 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="p-6 sm:p-8">
        
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2 rounded-md">
            <AlertCircle size={20} />
            <p>{globalError}</p>
          </div>
        )}

        {/* --- STEP 1: Información Personal --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 1: Información Personal</h2>

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
                <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-celeste text-xs font-bold text-slate-500 hover:text-celeste transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUploading ? 'Subiendo...' : 'Subir foto'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} disabled={isUploading} />
                </label>
              </div>
              {errors.foto && <p className="text-red-500 text-xs mt-1">{errors.foto}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Biografía / Sobre mí</label>
              <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={4} maxLength={1000}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none resize-none"
                placeholder="Cuéntanos sobre ti..." />
              <p className="text-xs text-slate-500 mt-1 text-right">{(formData.bio || '').length}/1000</p>
            </div>
          </div>
        )}

        {/* --- STEP 2: Información Académica --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 2: Información Académica</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carné UCR *</label>
                <input type="text" name="carnet_ucr" value={formData.carnet_ucr} onChange={handleChange} required
                  className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none transition-shadow ${errors.carnet_ucr ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="A00000" />
                {errors.carnet_ucr && <p className="text-red-500 text-xs mt-1">{errors.carnet_ucr}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carrera *</label>
                <select name="carrera" value={formData.carrera} onChange={handleChange} required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none bg-white">
                  <option value="" disabled>Seleccione una carrera</option>
                  {CARRERAS_UCR.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Escuela / Facultad *</label>
                <input type="text" name="escuela_facultad" value={formData.escuela_facultad} required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none transition-shadow bg-slate-100 opacity-70 cursor-not-allowed"
                  placeholder="Se asigna automáticamente" readOnly />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Sede UCR <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select name="sede" value={formData.sede} onChange={handleChange} required
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-celeste focus:ring-1 focus:ring-celeste/50 outline-none bg-white appearance-none">
                    <option value="" disabled>Seleccione una sede</option>
                    {(CARRERA_TO_SEDES[formData.carrera] || sedes).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Año de Ingreso *</label>
                <input type="number" name="anio_ingreso" value={formData.anio_ingreso} onChange={handleChange} required min="1950" max={new Date().getFullYear() + 1}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nivel Académico <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select name="nivel_academico" value={formData.nivel_academico} onChange={handleChange} required
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-celeste focus:ring-1 focus:ring-celeste/50 outline-none bg-white appearance-none">
                    <option value="bachillerato">Bachillerato</option>
                    <option value="licenciatura">Licenciatura</option>
                    <option value="maestria">Maestría</option>
                    <option value="doctorado">Doctorado</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Promedio Ponderado</label>
                <input type="number" name="promedio_ponderado" value={formData.promedio_ponderado || ''} onChange={handleChange} step="0.01" min="0" max="10"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none"
                  placeholder="Opcional" />
                <p className="text-xs text-slate-500 mt-1">Privado, usado para matching avanzado.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: Situación Socioeconómica --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 3: Situación Socioeconómica</h2>

            <div className="bg-celeste/10 border border-celeste/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-celeste flex gap-2">
                <AlertCircle className="shrink-0" size={20} />
                <span><strong>Privacidad:</strong> El nivel de beca es información privada. No será visible en tu perfil público ni en el directorio.</span>
              </p>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nivel de beca socioeconómica <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select name="beca_socioeconomica" value={formData.beca_socioeconomica} onChange={handleChange} required
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-celeste focus:ring-1 focus:ring-celeste/50 outline-none bg-white appearance-none text-base">
                  <option value="ninguna">Sin beca</option>
                  <option value="nivel1">Nivel 1</option>
                  <option value="nivel2">Nivel 2</option>
                  <option value="nivel3">Nivel 3</option>
                  <option value="nivel4">Nivel 4</option>
                  <option value="nivel5">Nivel 5</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 4: Proyecto de Graduación --- */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 4: Proyecto de Graduación</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título del proyecto *</label>
                <input type="text" name="proyecto_titulo" value={formData.proyecto_titulo} onChange={handleChange} required maxLength={200}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none" />
                <p className="text-xs text-slate-500 mt-1 text-right">{formData.proyecto_titulo.length}/200</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del proyecto *</label>
                <textarea name="proyecto_descripcion" value={formData.proyecto_descripcion} onChange={handleChange} required maxLength={1000} rows={4}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none resize-none" />
                <p className="text-xs text-slate-500 mt-1 text-right">{formData.proyecto_descripcion.length}/1000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de proyecto *</label>
                <div className="relative">
                  <select name="proyecto_tipo" value={formData.proyecto_tipo} onChange={handleChange} required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none bg-white appearance-none">
                    <option value="tfg">TFG</option>
                    <option value="tesis">Tesis</option>
                    <option value="practica_dirigida">Práctica Dirigida</option>
                    <option value="seminario">Seminario</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Área temática principal *</label>
                <div className="relative">
                  <select
                    value={formData.proyecto_area_tematica}
                    onChange={e => setFormData(prev => ({ ...prev, proyecto_area_tematica: e.target.value }))}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-celeste focus:ring-1 focus:ring-celeste/50 outline-none bg-white appearance-none"
                  >
                    <option value="">Seleccione un área...</option>
                    {AREAS_INTERES.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
                {errors.proyecto_area_tematica && <p className="text-red-500 text-xs mt-2">{errors.proyecto_area_tematica}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Porcentaje de avance: {formData.proyecto_porcentaje_avance}% *</label>
                <input type="range" name="proyecto_porcentaje_avance" min="0" max="100" value={formData.proyecto_porcentaje_avance} onChange={handleChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-celeste" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Necesidades específicas (Selecciona al menos una) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {necesidadesOpciones.map(nec => (
                    <label key={nec} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${formData.proyecto_necesidades.includes(nec) ? 'bg-celeste/10 border-celeste/30' : 'hover:bg-slate-50 border-slate-200'}`}>
                      <input type="checkbox" className="w-4 h-4 text-celeste rounded focus:ring-celeste/50"
                        checked={formData.proyecto_necesidades.includes(nec)}
                        onChange={() => handleCheckboxArray('proyecto_necesidades', nec)}
                      />
                      <span className="ml-3 text-sm text-slate-700">{nec}</span>
                    </label>
                  ))}
                </div>
                {errors.proyecto_necesidades && <p className="text-red-500 text-xs mt-2">{errors.proyecto_necesidades}</p>}
              </div>

              {/* Detalles adicionales del Proyecto */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Detalles adicionales del Proyecto</h3>
                
                {/* Financiamiento Toggle */}
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">¿Requiere financiamiento económico?</span>
                    <span className="text-xs text-slate-400">Habilita esta opción si tu proyecto necesita apoyo económico.</span>
                  </div>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" name="busca_financiamiento" id="busca_financiamiento_step4"
                      checked={formData.busca_financiamiento}
                      onChange={handleChange}
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                    <label htmlFor="busca_financiamiento_step4" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer"></label>
                  </div>
                </label>

                {/* Campos de Presupuesto (Condicionales) */}
                {formData.busca_financiamiento && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Monto solicitado</label>
                      <input type="number" name="proyecto_valor_monto" value={formData.proyecto_valor_monto || ''} onChange={handleChange} min="0" placeholder="Ej: 500000"
                        className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-celeste focus:ring-1 focus:ring-celeste/50 outline-none bg-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Moneda</label>
                      <div className="relative">
                        <select name="proyecto_valor_moneda" value={formData.proyecto_valor_moneda} onChange={handleChange}
                          className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-celeste focus:ring-1 focus:ring-celeste/50 outline-none bg-white appearance-none text-sm">
                          <option value="CRC">Colones (CRC)</option>
                          <option value="USD">Dólares (USD)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Enlace de Video */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Enlace a video explicativo <span className="text-slate-400 font-normal">(opcional)</span></label>
                  <input type="url" name="proyecto_video_url" value={formData.proyecto_video_url || ''} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-celeste focus:ring-1 focus:ring-celeste/50 outline-none bg-white text-sm" />
                  <p className="text-[11px] text-slate-400 mt-1">Comparte un video en YouTube, Vimeo o Google Drive presentando tu proyecto.</p>
                  {errors.proyecto_video_url && <p className="text-red-500 text-xs mt-1">{errors.proyecto_video_url}</p>}
                </div>

                {/* Carga de Foto del Proyecto */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Foto o Imagen del Proyecto <span className="text-slate-400 font-normal">(opcional, máx. 5MB)</span></label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <label className={`cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-celeste text-xs font-bold text-slate-500 hover:text-celeste transition-all bg-slate-50 hover:bg-white grow sm:grow-0 ${isProjPhotoUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isProjPhotoUploading ? 'Subiendo foto...' : 'Subir imagen'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleProjPhoto} disabled={isProjPhotoUploading} />
                    </label>
                    {formData.proyecto_foto_url ? (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-medium gap-2 max-w-full overflow-hidden shrink-0">
                        <span className="truncate">🖼️ Imagen del proyecto subida</span>
                        <button type="button" onClick={() => setFormData(p => ({ ...p, proyecto_foto_url: '' }))} className="text-rose-500 hover:text-rose-700 font-bold ml-2">Remover</button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Ninguna imagen cargada aún.</span>
                    )}
                  </div>
                  {errors.proyecto_foto && <p className="text-red-500 text-xs mt-1">{errors.proyecto_foto}</p>}
                  
                  {/* Vista previa de la imagen del proyecto */}
                  {formData.proyecto_foto_url && (
                    <div className="mt-3 max-w-xs rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
                      <img src={getProyectoFileUrl(formData.proyecto_foto_url) || ''} alt="Vista previa del proyecto" className="w-full h-auto max-h-40 object-cover" />
                    </div>
                  )}
                </div>

                {/* Carga de Documento */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Documento del proyecto (PDF) <span className="text-slate-400 font-normal">(opcional, máx. 10MB)</span></label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <label className={`cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-celeste text-xs font-bold text-slate-500 hover:text-celeste transition-all bg-slate-50 hover:bg-white grow sm:grow-0 ${isDocUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isDocUploading ? 'Subiendo documento...' : 'Adjuntar PDF'}
                      <input type="file" accept="application/pdf" className="hidden" onChange={handleDocFile} disabled={isDocUploading} />
                    </label>
                    {formData.proyecto_documento_url ? (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-medium gap-2 max-w-full overflow-hidden shrink-0">
                        <span className="truncate">📄 {formData.proyecto_documento_url.split('/').pop()}</span>
                        <button type="button" onClick={() => setFormData(p => ({ ...p, proyecto_documento_url: '' }))} className="text-rose-500 hover:text-rose-700 font-bold ml-2">Remover</button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Ningún documento adjunto aún.</span>
                    )}
                  </div>
                  {errors.documento && <p className="text-red-500 text-xs mt-1">{errors.documento}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 5: Áreas de Interés --- */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 5: Áreas de Interés del Proyecto</h2>

            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <strong>Nota:</strong> Selecciona las áreas temáticas con las que se relaciona tu proyecto.
              Este es el campo más importante para hacer el <em>matching</em> interdisciplinario.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Área de interés principal *</label>
              <div className="relative">
                <select
                  value={formData.areas_de_interes[0] || ''}
                  onChange={e => setFormData(prev => ({ ...prev, areas_de_interes: e.target.value ? [e.target.value] : [] }))}
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-celeste focus:ring-1 focus:ring-celeste/50 outline-none bg-white appearance-none"
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

        {/* --- STEP 6: Tipo de Apoyo --- */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 6: Tipo de Apoyo Buscado</h2>

            <div className="space-y-3">
              {[
                { name: 'busca_mentoria', label: '¿Busca mentoría técnica?' },
                { name: 'busca_empleo', label: '¿Busca empleo mientras estudia?' },
                { name: 'busca_pasantia', label: '¿Busca pasantía relacionada?' },
              ].map(item => (
                <label key={item.name} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <span className="text-sm font-medium text-slate-800">{item.label}</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name={item.name} id={item.name}
                      checked={formData[item.name as keyof StudentFormData] as boolean}
                      onChange={handleChange}
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                    <label htmlFor={item.name} className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer"></label>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* --- STEP 7: Habilidades y Pasatiempos --- */}
        {step === 7 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-bold text-slate-900 border-b pb-2">Sección 7: Habilidades y Pasatiempos</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Habilidades Técnicas <span className="text-slate-400 font-normal">(opcional)</span></label>
              <p className="text-xs text-slate-500 mb-3">Escribe tus habilidades separadas por comas (Ej: Python, AutoCAD, SPSS, diseño UX)</p>
              <textarea name="habilidadesText" value={formData.habilidadesText} onChange={handleChange} rows={3}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none resize-none"
                placeholder="Python, Excel, Redacción técnica, Análisis de datos..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pasatiempos / Hobbies <span className="text-slate-400 font-normal">(opcional)</span></label>
              <p className="text-xs text-slate-500 mb-3">Escribe tus pasatiempos separados por comas (Ej: Senderismo, Fotografía, Cocina, Lectura). Ayudan a hacer mejores conexiones.</p>
              <textarea name="hobbiesText" value={formData.hobbiesText || ''} onChange={handleChange} rows={2}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-celeste/50 outline-none resize-none"
                placeholder="Senderismo, Fotografía, Cocina, Lectura..." />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-start gap-4">
              <CheckCircle2 className="text-green-600 mt-0.5" size={24} />
              <div>
                <h3 className="font-semibold text-green-800">¡Casi listo!</h3>
                <p className="text-sm text-green-700 mt-1">Revisa que toda la información ingresada sea correcta. Una vez guardes el perfil, serás parte del directorio y podrás comenzar a recibir oportunidades y conectar con exalumnos.</p>
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
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white transition-all shadow-sm ${isSubmitting ? 'bg-celeste/50 cursor-not-allowed' : 'bg-celeste hover:opacity-90 hover:shadow'}`}>
            {isSubmitting ? 'Guardando...' : (step === 7 ? (isEditMode ? 'Guardar Cambios' : 'Completar Perfil') : 'Siguiente')}
            {step < 7 && <ArrowRight size={16} />}
          </button>
        </div>
      </form>
      <style jsx>{`
        .toggle-checkbox:checked { right: 0; border-color: #54BCEB; }
        .toggle-checkbox:checked + .toggle-label { background-color: #54BCEB; }
        .toggle-checkbox { right: 1.25rem; z-index: 1; border-color: #cbd5e1; transition: all 0.3s; }
      `}</style>
    </div>
  );
}
