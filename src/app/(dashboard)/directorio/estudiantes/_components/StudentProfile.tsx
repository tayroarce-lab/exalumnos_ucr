'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { EstudianteDirectorio } from '@/types/estudiantes';
import GrillaEstudiantes from './GrillaEstudiantes';
import { getAvatarUrl, getProyectoFileUrl } from '@/lib/utils';
import Link from 'next/link';
import ProyectoDonacionesProgreso from '@/components/ProyectoDonacionesProgreso';
import ModalProyectoEstudiante from './ModalProyectoEstudiante';

interface Props {
  estudiante: EstudianteDirectorio;
  estudiantesRelacionados: EstudianteDirectorio[];
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const IconMail = ({ size = 15, className, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconShare = ({ size = 15, className, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
  </svg>
);
const IconHand = ({ size = 16, className, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const IconBrain = ({ size = 16, className, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.98-3 2.5 2.5 0 0 1-1.32-4.24A3 3 0 0 1 4.5 8.5a2.5 2.5 0 0 1 5-1"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.98-3 2.5 2.5 0 0 0 1.32-4.24A3 3 0 0 0 19.5 8.5a2.5 2.5 0 0 0-5-1"/>
  </svg>
);
const IconMonitor = ({ size = 16, className, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
  </svg>
);
const IconLock = ({ color = '#dc2626', size = 16, className, ...props }: IconProps & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconBulb = ({ size = 15, className, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>
);
const IconSupport = ({ size = 15, className, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/>
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const IconDot = ({ size = 9, className, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
  </svg>
);
const IconMoney = ({ size = 9, className, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const IconCheckCircle = ({ size = 14, className = "inline-block text-[#1A5B75]", ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconCrossCircle = ({ size = 14, className = "inline-block text-red-500", ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const getDeterministicSuffix = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 9000) + 1000;
};

export default function StudentProfile({ estudiante, estudiantesRelacionados }: Props) {
  const iniciales = estudiante.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const tecnicas = estudiante.habilidades_tecnicas ?? [];
  const blandas = estudiante.habilidades_blandas ?? [];
  const nd = (v: any) => v || 'No disponible';
  
  // Especialización Principal Fallback
  const especializacion = estudiante.proyecto_area_tematica || estudiante.proyecto_tipo || (estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0 ? estudiante.areas_de_interes[0] : 'Información no disponible');

  // Modal states
  const [showMentoriaModal, setShowMentoriaModal] = React.useState(false);
  const [showApoyarModal, setShowApoyarModal] = React.useState(false);
  const [showProyectoModal, setShowProyectoModal] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          const { data: dbUser } = await supabase.from('users').select('rol').eq('id', user.id).single()
          setIsAdmin(dbUser?.rol === 'admin' || user.user_metadata?.rol === 'admin')
        }
      })
    })
  }, []);

  const getTagsApoyo = () => {
    const tags = [];
    if (estudiante.busca_financiamiento) tags.push("Financiamiento");
    if (estudiante.busca_mentoria) tags.push("Mentoría");
    if (estudiante.busca_empleo) tags.push("Empleo");
    if (estudiante.busca_pasantia) tags.push("Pasantía");
    return tags;
  };

  const avance = estudiante.proyecto_porcentaje_avance || 0;
  const progresoProyecto = estudiante.proyecto_porcentaje_avance || 0;

  const tituloProyecto = estudiante.proyecto_titulo || 'Proyecto sin título';
  const descripcionProyecto = estudiante.proyecto_descripcion || 'Sin descripción disponible del proyecto.';
  const areaTematica = estudiante.proyecto_area_tematica || estudiante.proyecto_tipo || 'General';
  const habilidadesTecnicasData = tecnicas.length > 0 ? tecnicas : [];

  const deportesData = estudiante.deportes || [];
  const musicaData = estudiante.musica || [];
  const hobbiesData = estudiante.hobbies || [];
  const idiomasData = estudiante.idiomas || [];

  const pasionesMatch = [...deportesData.slice(0,1), ...musicaData.slice(0,1), ...hobbiesData.slice(0,1)];

  return (
    <div className="font-sans text-slate-900 max-w-7xl mx-auto pb-12">
      {/* Layout: dos columnas en desktop/tablet, una en móvil */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* â•â•â• COLUMNA IZQUIERDA — Sidebar sticky â•â•â• */}
        <div className="w-full md:w-[320px] lg:w-[360px] md:shrink-0 md:sticky md:top-6 space-y-6">

          {/*  SECCIÓN DE CABECERA UNIFICADA (DISEÑO BANNER)  */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden">
            {/* Banner: imagen personalizada o gradiente predeterminado */}
            <div className="h-32 md:h-36 w-full relative overflow-hidden bg-slate-100">
              {estudiante.banner_url && (
                <img 
                  src={estudiante.banner_url} 
                  alt="Banner de Perfil" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Fila de Avatar e Información */}
            <div className="px-6 pb-5 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
                {/* Contenedor de Avatar con borde blanco y margen negativo */}
                <div className="-mt-14 sm:-mt-16 w-28 h-28 rounded-full p-1 bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-full bg-slate-50 p-0.5 overflow-hidden flex items-center justify-center">
                    {estudiante.foto_url ? (
                      <img src={getAvatarUrl(estudiante.foto_url) as string} alt={estudiante.nombre} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-slate-400 font-black text-3xl">{iniciales}</span>
                    )}
                  </div>
                </div>

                {/* Datos del estudiante */}
                <div className="mt-4 sm:mt-3 flex-1 space-y-1 pb-1 sm:pb-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{estudiante.nombre}</h1>
                  {estudiante.carrera && <p className="text-xs font-bold text-slate-500">{estudiante.carrera}</p>}
                  {estudiante.sede && (
                    <p className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                      Sede de {estudiante.sede}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/*  CARD DE COMPATIBILIDAD  */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compatibilidad</span>
              <span className="text-lg font-black text-slate-900">{avance}%</span>
            </div>
            {/* Barra de Progreso */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
              <div 
                className="bg-slate-900 h-2 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${avance}%` }}
              />
            </div>
            {/* Grid de Criterios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-medium text-slate-600 mb-4">
              <div className="flex items-center gap-2">
                <IconCheckCircle size={14} className="text-slate-400" /> Carrera afín
              </div>
              <div className="flex items-center gap-2">
                <IconCheckCircle size={14} className="text-slate-400" /> Ubicación
              </div>
              <div className="flex items-center gap-2">
                <IconCheckCircle size={14} className="text-slate-400" /> Intereses comunes
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <IconCrossCircle size={14} /> Disponibilidad horaria
              </div>
            </div>

            {/*  PASIONES HUMANAS EN EL MATCH  */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Intereses Compartidos</p>
              <div className="flex flex-wrap gap-2">
                {pasionesMatch.map((p, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/*  BOTONES DE ACCIÓN  */}
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setShowMentoriaModal(true)}
              className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <IconMail size={16} /> Contactar
            </button>
            <button className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 px-4 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer">
              <IconShare size={16} /> Compartir
            </button>
          </div>

          {/*  COLUMNAS OPORTUNIDADES E INTERESES  */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Oportunidades</div>
              <div className="text-xs font-semibold text-slate-700">
                {getTagsApoyo().length > 0 ? getTagsApoyo().join(', ') : <span className="text-slate-400 italic font-normal">Sin registrar</span>}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Intereses</div>
              <div className="text-xs font-semibold text-slate-700">
                {blandas.length > 0 ? blandas.slice(0, 3).join(', ') : <span className="text-slate-400 italic font-normal">Sin registrar</span>}
              </div>
            </div>
          </div>

          {/*  EXPEDIENTE ACADÉMICO  */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Expediente Académico</h3>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-1">Carné</p>
                <p className="text-sm font-bold text-slate-900">{estudiante.carnet_ucr || (estudiante.anio_ingreso ? `B${estudiante.anio_ingreso}${getDeterministicSuffix(estudiante.user_id || estudiante.nombre)}` : '—')}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-1">Sede</p>
                <p className="text-sm font-bold text-slate-900">{estudiante.sede || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-1">Nivel Actual</p>
                <p className="text-sm font-bold text-slate-900">{estudiante.nivel_academico || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-1">Año Ingreso</p>
                <p className="text-sm font-bold text-slate-900">{estudiante.anio_ingreso || '—'}</p>
              </div>
            </div>
          </div>

          {/*  PRIVACIDAD  */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información Privada</h4>
              <IconLock size={14} className="text-slate-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Nivel de Beca</span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {isAdmin ? (estudiante.beca_socioeconomica || '—') : <span className="text-slate-400 font-normal">Restringido</span>}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Promedio Ponderado</span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {isAdmin ? (estudiante.promedio_ponderado || '—') : <span className="text-slate-400 font-normal">Restringido</span>}
                </span>
              </div>
            </div>
          </div>

          {/*  ACCIONES PARA MENTORES  */}
          {(estudiante.busca_mentoria || estudiante.busca_financiamiento) && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest mb-4">Acciones de Apoyo</p>
              <div className="flex flex-col gap-3">
                {estudiante.busca_mentoria && (
                  <button 
                    onClick={() => setShowMentoriaModal(true)}
                    className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 py-3 px-4 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer border border-slate-200"
                  >
                    Ofrecer Mentoría
                  </button>
                )}
                {estudiante.busca_financiamiento && (
                  <button 
                    onClick={() => setShowApoyarModal(true)}
                    className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 py-3 px-4 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    Apoyar Proyecto
                  </button>
                )}
              </div>
            </div>
          )}

        </div>{/* fin sidebar izquierdo */}


        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            COLUMNA DERECHA — Contenido principal
            â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div className="flex-1 min-w-0 space-y-6">

          {/*  CARD PROYECTO TFG  */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proyecto de Graduación</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{areaTematica}</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
              {tituloProyecto}
            </h2>
            
            {/* Imagen de Proyecto si existe */}
            {estudiante.proyecto_foto_url && (
              <div className="rounded-xl overflow-hidden mb-8 max-h-64 w-full bg-slate-50 border border-slate-100">
                <img 
                  src={getProyectoFileUrl(estudiante.proyecto_foto_url) || ''} 
                  alt={tituloProyecto}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Progreso Minimalista */}
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Avance Académico</span>
                <span className="text-slate-900">{progresoProyecto}%</span>
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-900 h-1 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${progresoProyecto}%` }}
                />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descripción</h5>
              <p className="text-sm md:text-base text-slate-600 font-normal leading-relaxed whitespace-pre-wrap">
                {descripcionProyecto}
              </p>
            </div>

            {estudiante.proyecto_beneficios && (
              <div className="space-y-4 mb-8">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beneficios para Patrocinadores</h5>
                <p className="text-sm md:text-base text-slate-600 font-normal leading-relaxed whitespace-pre-wrap">{estudiante.proyecto_beneficios}</p>
                {estudiante.proyecto_beneficios_fotos && estudiante.proyecto_beneficios_fotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {estudiante.proyecto_beneficios_fotos.map((fotoUrl, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden aspect-square bg-slate-50 border border-slate-100">
                        <img 
                          src={getProyectoFileUrl(fotoUrl) || ''} 
                          alt={`Recompensa ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tipos de apoyo */}
            {(estudiante.busca_financiamiento || estudiante.busca_mentoria || estudiante.busca_empleo || estudiante.busca_pasantia) && (
              <div className="space-y-4 mb-8">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apoyo Solicitado</h5>
                <div className="flex flex-wrap gap-3">
                  {estudiante.busca_financiamiento && (
                    <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
                      Económico
                    </span>
                  )}
                  {estudiante.busca_mentoria && (
                    <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
                      Mentoría
                    </span>
                  )}
                  {estudiante.busca_empleo && (
                    <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
                      Empleo
                    </span>
                  )}
                  {estudiante.busca_pasantia && (
                    <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
                      Pasantía
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Financiamiento Colectivo */}
            {estudiante.busca_financiamiento && estudiante.proyecto_valor_monto && (
              <div className="space-y-4 mb-8">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta de Financiamiento</h5>
                <ProyectoDonacionesProgreso 
                  proyectoId={estudiante.user_id} 
                  metaMonto={estudiante.proyecto_valor_monto} 
                  metaMoneda={estudiante.proyecto_valor_moneda || 'USD'} 
                  mostrarBotonApoyar={false} 
                />
              </div>
            )}

            {/* Enlaces y Acciones */}
            <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-slate-100">
              {(estudiante.proyecto_documento_url || estudiante.proyecto_video_url) && (
                <div className="flex flex-wrap gap-6 mb-4">
                  {estudiante.proyecto_documento_url && (
                    <a 
                      href={getProyectoFileUrl(estudiante.proyecto_documento_url) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-slate-900 hover:text-slate-500 transition-colors"
                    >
                       Ver Documentación â†—
                    </a>
                  )}
                  {estudiante.proyecto_video_url && (
                    <a 
                      href={estudiante.proyecto_video_url.startsWith('http') ? estudiante.proyecto_video_url : `https://${estudiante.proyecto_video_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-slate-900 hover:text-slate-500 transition-colors"
                    >
                       Ver Video Pitch â†—
                    </a>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowProyectoModal(true)}
                  className="flex-1 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-sm font-bold transition-all active:scale-95 shadow-sm"
                >
                  Ver en Detalle
                </button>
                
                {(estudiante.busca_financiamiento || estudiante.busca_mentoria || estudiante.busca_empleo || estudiante.busca_pasantia) && (
                  <button
                    onClick={() => setShowApoyarModal(true)}
                    className="flex-1 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-sm transition-all active:scale-95"
                  >
                    Ofrecer Apoyo 
                  </button>
                )}
              </div>
            </div>
          </div>

          {/*  MI PRESENTACIÓN  */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Presentación Personal</p>
            <p className="text-sm md:text-base text-slate-600 font-normal leading-relaxed">
              {estudiante.sobre_mi ||
                <span className="italic text-slate-400">El estudiante aún no ha redactado su presentación personal.</span>
              }
            </p>
          </div>

          {/*  HABILIDADES TÉCNICAS  */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Habilidades Técnicas</p>
            <div className="flex flex-wrap gap-2">
              {habilidadesTecnicasData.length > 0 ? (
                habilidadesTecnicasData.map((h, i) => (
                  <span key={i} className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
                    {h}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400 italic">No ha registrado habilidades técnicas.</span>
              )}
            </div>
          </div>

          {/*  VIDA MÁS ALLÁ DEL AULA  */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Vida Más Allá del Aula</h3>

            {estudiante.sobre_mi_personal && (
              <div className="mb-8">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3">En mis propias palabras</p>
                <p className="text-sm text-slate-600 font-normal leading-relaxed italic border-l-2 border-slate-200 pl-4 py-1">
                  &ldquo;{estudiante.sobre_mi_personal}&rdquo;
                </p>
              </div>
            )}

            <div className="space-y-6">
              {deportesData.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3">Deportes & Actividad Física</p>
                  <div className="flex flex-wrap gap-2">
                    {deportesData.map((d, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              {musicaData.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3">Música & Artes</p>
                  <div className="flex flex-wrap gap-2">
                    {musicaData.map((m, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {hobbiesData.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3">Pasatiempos & Hobbies</p>
                  <div className="flex flex-wrap gap-2">
                    {hobbiesData.map((h, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium">{h}</span>
                    ))}
                  </div>
                </div>
              )}
              {idiomasData.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3">Idiomas</p>
                  <div className="flex flex-wrap gap-2">
                    {idiomasData.map((lang, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium">{lang}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/*  TRAYECTORIA ESTUDIANTIL  */}
          {estudiante.actividades_extracurriculares && estudiante.actividades_extracurriculares.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Trayectoria Estudiantil</p>
              <div className="space-y-0 divide-y divide-slate-100">
                {estudiante.actividades_extracurriculares.map((act, index) => (
                  <div key={index} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
                    <p className="text-sm text-slate-700 font-medium">{act}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*  ESTUDIANTES RELACIONADOS  */}
          {estudiantesRelacionados.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Otros perfiles similares</h2>
              {estudiante.carrera && (
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  Estudiantes de <strong className="text-slate-900">{estudiante.carrera}</strong>.
                </p>
              )}
              <GrillaEstudiantes estudiantes={estudiantesRelacionados} />
            </div>
          )}

        </div>{/* fin columna derecha */}

      </div>{/* fin layout dos columnas */}

      {/*  MODAL MENTORÍA  */}
      {showMentoriaModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowMentoriaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-2xl font-bold cursor-pointer"
            >
              &times;
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900 mb-1">Ofrecer Mentoría</h2>
              <p className="text-xs text-slate-500 font-medium">
                Has seleccionado ofrecer mentoría a <strong className="text-slate-900 font-bold">{estudiante.nombre}</strong>.
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-3.5">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Carrera</p>
                <p className="text-xs font-bold text-slate-900">{nd(estudiante.carrera)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Especialización Principal</p>
                <p className="text-xs font-bold text-slate-900">{especializacion}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Áreas de Interés</p>
                <div className="flex flex-wrap gap-1.5">
                  {estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0 ? (
                    estudiante.areas_de_interes.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-[10px] font-bold shadow-sm">
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No especificado</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">
              Las mentorías son una excelente forma de conectar exalumnos experimentados con estudiantes que requieren orientación. 
            </p>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-3">Información de Contacto</p>
              {estudiante.url_linkedin || estudiante.url_portfolio ? (
                <div className="flex gap-3">
                  {estudiante.url_linkedin && (
                    <a href={estudiante.url_linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex-1 shadow-sm active:scale-95 transition-colors">
                      LinkedIn
                    </a>
                  )}
                  {estudiante.url_portfolio && (
                    <a href={estudiante.url_portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 text-xs font-bold flex-1 shadow-sm active:scale-95 transition-colors">
                      Portafolio
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-dashed border-slate-200">
                  <span className="text-xs text-slate-400 italic">La información de contacto será habilitada por la administración.</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowMentoriaModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/*  MODAL APÓYAR PROYECTO  */}
      {showApoyarModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9998] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowApoyarModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-2xl font-bold cursor-pointer"
            >
              &times;
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900 mb-1">Apoyar Proyecto</h2>
              <p className="text-xs text-slate-500 font-medium">
                Estás a punto de apoyar a <strong className="text-slate-900 font-bold">{estudiante.nombre}</strong> en su proyecto.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-3.5">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Carrera</p>
                <p className="text-xs font-bold text-slate-900">{nd(estudiante.carrera)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Especialización Principal</p>
                <p className="text-xs font-bold text-slate-900">{especializacion}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Áreas de Interés</p>
                <div className="flex flex-wrap gap-1.5">
                  {estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0 ? (
                    estudiante.areas_de_interes.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-[10px] font-bold shadow-sm">
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No especificado</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">
              Puedes ver el LinkedIn o el Portafolio del estudiante si están disponibles para coordinar directamente el tipo de apoyo requerido.
            </p>

            <div className="border-t border-slate-100 pt-5 mb-6">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-3">Redes de Contacto</p>
              {estudiante.url_linkedin || estudiante.url_portfolio ? (
                <div className="flex gap-3">
                  {estudiante.url_linkedin && (
                    <a href={estudiante.url_linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex-1 shadow-sm active:scale-95 transition-colors">
                      LinkedIn
                    </a>
                  )}
                  {estudiante.url_portfolio && (
                    <a href={estudiante.url_portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 text-xs font-bold flex-1 shadow-sm active:scale-95 transition-colors">
                      Portafolio
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-dashed border-slate-200">
                  <span className="text-xs text-slate-400 italic">La información de contacto será habilitada por la administración.</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-5 mb-6">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-3">Apoyo Financiero</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs text-slate-600 font-medium">
                  Puedes realizar una donación directa para apoyar la trayectoria de este estudiante a través de la pasarela de pagos.
                </p>
                <Link 
                  href={`/donations?proyecto_id=${estudiante.user_id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                  Donar por SINPE Móvil
                </Link>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowApoyarModal(false)} 
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Detalles del Proyecto Completo */}
      {showProyectoModal && createPortal(
        <ModalProyectoEstudiante
          estudiante={estudiante}
          onClose={() => setShowProyectoModal(false)}
          onOfrecerApoyo={() => {
            setShowProyectoModal(false);
            setShowApoyarModal(true);
          }}
        />,
        document.body
      )}
    </div>
  );
}

