"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CARRERAS_UCR, CARRERA_TO_ESCUELA, CARRERA_TO_SEDES } from '@/constants/catalogs';

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
  
  habilidadesText: z.string().optional()
});

type StudentFormData = z.infer<typeof studentSchema>;

const initialData: StudentFormData = {
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
  habilidadesText: ''
};

const areasTematicas = ['Tecnología', 'Salud', 'Ciencias Básicas', 'Ingeniería', 'Ciencias Sociales', 'Artes y Letras', 'Economía y Negocios', 'Medio Ambiente', 'Educación', 'Derecho', 'Arquitectura y Diseño', 'Agroalimentarias'];
const necesidadesOpciones = ['Financiamiento', 'Mentoría técnica', 'Acceso a datos', 'Infraestructura', 'Validación empresarial', 'Empleo paralelo'];

export default function StudentOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<StudentFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleNext = () => {
    // Aquí podríamos validar la sección actual, pero por simplicidad validamos al final
    setStep((prev) => Math.min(prev + 1, 6));
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
      // Validate
      const validData = studentSchema.parse(formData);
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No hay usuario autenticado.");
      }

      // Convert habilidadesText to array
      const habilidadesArray = validData.habilidadesText
        ? validData.habilidadesText.split(',').map(h => h.trim()).filter(h => h.length > 0)
        : [];

      // Update in DB
      const { error } = await supabase.from('estudiantes').update({
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
        perfil_completo: true
      }).eq('user_id', user.id);

      if (error) throw error;

      router.push('/dashboard');
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        let firstErrorStep = 6;
        
        const stepMapping: Record<string, number> = {
          carnet_ucr: 1, carrera: 1, escuela_facultad: 1, sede: 1, anio_ingreso: 1, nivel_academico: 1, promedio_ponderado: 1,
          beca_socioeconomica: 2,
          proyecto_titulo: 3, proyecto_descripcion: 3, proyecto_area_tematica: 3, proyecto_tipo: 3, proyecto_porcentaje_avance: 3, proyecto_necesidades: 3,
          areas_de_interes: 4,
          busca_financiamiento: 5, busca_mentoria: 5, busca_empleo: 5, busca_pasantia: 5,
          habilidadesText: 6
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6">
        <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Paso {step} de 6</span>
          <span>{Math.round((step / 6) * 100)}% Completado</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }}></div>
        </div>
      </div>

      <form onSubmit={step === 6 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="p-6 sm:p-8">
        
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2 rounded-md">
            <AlertCircle size={20} />
            <p>{globalError}</p>
          </div>
        )}

        {/* --- STEP 1: Información Académica --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Sección 1: Información Académica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carné UCR *</label>
                <input type="text" name="carnet_ucr" value={formData.carnet_ucr} onChange={handleChange} required
                  className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${errors.carnet_ucr ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="A00000" />
                {errors.carnet_ucr && <p className="text-red-500 text-xs mt-1">{errors.carnet_ucr}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carrera *</label>
                <select name="carrera" value={formData.carrera} onChange={handleChange} required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="" disabled>Seleccione una carrera</option>
                  {CARRERAS_UCR.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Escuela / Facultad *</label>
                <input type="text" name="escuela_facultad" value={formData.escuela_facultad} required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-slate-100 opacity-70 cursor-not-allowed"
                  placeholder="Se asigna automáticamente" readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sede UCR *</label>
                <select name="sede" value={formData.sede} onChange={handleChange} required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="" disabled>Seleccione una sede</option>
                  {(CARRERA_TO_SEDES[formData.carrera] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Año de Ingreso *</label>
                <input type="number" name="anio_ingreso" value={formData.anio_ingreso} onChange={handleChange} required min="1950" max={new Date().getFullYear() + 1}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nivel Académico *</label>
                <select name="nivel_academico" value={formData.nivel_academico} onChange={handleChange} required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="bachillerato">Bachillerato</option>
                  <option value="licenciatura">Licenciatura</option>
                  <option value="maestria">Maestría</option>
                  <option value="doctorado">Doctorado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Promedio Ponderado</label>
                <input type="number" name="promedio_ponderado" value={formData.promedio_ponderado || ''} onChange={handleChange} step="0.01" min="0" max="10"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Opcional" />
                <p className="text-xs text-slate-500 mt-1">Privado, usado para matching avanzado.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: Situación Socioeconómica --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Sección 2: Situación Socioeconómica</h2>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 flex gap-2">
                <AlertCircle className="shrink-0" size={20} />
                <span><strong>Privacidad:</strong> El nivel de beca es información privada. No será visible en tu perfil público ni en el directorio. Solo se revelará a un exalumno si tú aceptas explícitamente su solicitud de contacto.</span>
              </p>
            </div>

            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nivel de beca socioeconómica *</label>
              <select name="beca_socioeconomica" value={formData.beca_socioeconomica} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-base">
                <option value="ninguna">Sin beca</option>
                <option value="nivel1">Nivel 1</option>
                <option value="nivel2">Nivel 2</option>
                <option value="nivel3">Nivel 3</option>
                <option value="nivel4">Nivel 4</option>
                <option value="nivel5">Nivel 5</option>
              </select>
            </div>
          </div>
        )}

        {/* --- STEP 3: Proyecto de Graduación --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Sección 3: Proyecto de Graduación</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título del proyecto *</label>
                <input type="text" name="proyecto_titulo" value={formData.proyecto_titulo} onChange={handleChange} required maxLength={200}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <p className="text-xs text-slate-500 mt-1 text-right">{formData.proyecto_titulo.length}/200</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del proyecto *</label>
                <textarea name="proyecto_descripcion" value={formData.proyecto_descripcion} onChange={handleChange} required maxLength={1000} rows={4}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                <p className="text-xs text-slate-500 mt-1 text-right">{formData.proyecto_descripcion.length}/1000</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área temática principal *</label>
                  <select name="proyecto_area_tematica" value={formData.proyecto_area_tematica} onChange={handleChange} required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="" disabled>Seleccione un área</option>
                    {areasTematicas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de proyecto *</label>
                  <select name="proyecto_tipo" value={formData.proyecto_tipo} onChange={handleChange} required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="tfg">TFG</option>
                    <option value="tesis">Tesis</option>
                    <option value="practica_dirigida">Práctica Dirigida</option>
                    <option value="seminario">Seminario</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Porcentaje de avance: {formData.proyecto_porcentaje_avance}% *</label>
                <input type="range" name="proyecto_porcentaje_avance" min="0" max="100" value={formData.proyecto_porcentaje_avance} onChange={handleChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Necesidades específicas (Selecciona al menos una) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {necesidadesOpciones.map(nec => (
                    <label key={nec} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${formData.proyecto_necesidades.includes(nec) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-200'}`}>
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        checked={formData.proyecto_necesidades.includes(nec)}
                        onChange={() => handleCheckboxArray('proyecto_necesidades', nec)}
                      />
                      <span className="ml-3 text-sm text-slate-700">{nec}</span>
                    </label>
                  ))}
                </div>
                {errors.proyecto_necesidades && <p className="text-red-500 text-xs mt-2">{errors.proyecto_necesidades}</p>}
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 4: Áreas de Interés --- */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Sección 4: Áreas de Interés del Proyecto</h2>
            
            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <strong>Nota:</strong> Selecciona las áreas temáticas con las que se relaciona tu proyecto. 
              Este es el campo más importante para hacer el <em>matching</em> interdisciplinario (p. ej. un biólogo puede marcar "Tecnología" si usa bioinformática).
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Áreas de interés (Mínimo 1) *</label>
              <div className="flex flex-wrap gap-2">
                {areasTematicas.map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleCheckboxArray('areas_de_interes', area)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      formData.areas_de_interes.includes(area)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              {errors.areas_de_interes && <p className="text-red-500 text-xs mt-2">{errors.areas_de_interes}</p>}
            </div>
          </div>
        )}

        {/* --- STEP 5: Tipo de Apoyo --- */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Sección 5: Tipo de Apoyo Buscado</h2>
            
            <div className="space-y-3">
              {[
                { name: 'busca_financiamiento', label: '¿Busca financiamiento económico?' },
                { name: 'busca_mentoria', label: '¿Busca mentoría técnica?' },
                { name: 'busca_empleo', label: '¿Busca empleo mientras estudia?' },
                { name: 'busca_pasantia', label: '¿Busca pasantía relacionada?' },
              ].map(item => (
                <label key={item.name} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <span className="text-sm font-medium text-slate-800">{item.label}</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name={item.name} id={item.name} checked={formData[item.name as keyof StudentFormData] as boolean} onChange={handleChange} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                    <label htmlFor={item.name} className={`toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer ${formData[item.name as keyof StudentFormData] ? 'bg-blue-500' : ''}`}></label>
                  </div>
                </label>
              ))}
            </div>
            {/* Minimal CSS for toggle switches if Tailwind doesn't have it natively without plugins */}
            <style jsx>{`
              .toggle-checkbox:checked {
                right: 0;
                border-color: #3b82f6;
              }
              .toggle-checkbox:checked + .toggle-label {
                background-color: #3b82f6;
              }
              .toggle-checkbox {
                right: 1.25rem;
                z-index: 1;
                border-color: #cbd5e1;
                transition: all 0.3s;
              }
            `}</style>
          </div>
        )}

        {/* --- STEP 6: Habilidades --- */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Sección 6: Habilidades</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Habilidades Técnicas (Opcional)</label>
              <p className="text-xs text-slate-500 mb-3">Escribe tus habilidades separadas por comas (Ej: Python, AutoCAD, SPSS, diseño UX)</p>
              <textarea name="habilidadesText" value={formData.habilidadesText} onChange={handleChange} rows={3}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Python, Excel, Redacción técnica, Análisis de datos..." />
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${step === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>
            <ArrowLeft size={18} /> Atrás
          </button>
          
          <button type="submit" disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all shadow-sm ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow'}`}>
            {isSubmitting ? 'Guardando...' : (step === 6 ? 'Completar Perfil' : 'Siguiente')}
            {step < 6 && <ArrowRight size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}
