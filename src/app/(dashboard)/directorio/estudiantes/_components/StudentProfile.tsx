'use client';

import React from 'react';
import { EstudianteDirectorio } from '@/types/estudiantes';
import GrillaEstudiantes from './GrillaEstudiantes';
import { getAvatarUrl } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  estudiante: EstudianteDirectorio;
  estudiantesRelacionados: EstudianteDirectorio[];
}

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconShare = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
  </svg>
);
const IconHand = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const IconBrain = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.98-3 2.5 2.5 0 0 1-1.32-4.24A3 3 0 0 1 4.5 8.5a2.5 2.5 0 0 1 5-1"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.98-3 2.5 2.5 0 0 0 1.32-4.24A3 3 0 0 0 19.5 8.5a2.5 2.5 0 0 0-5-1"/>
  </svg>
);
const IconMonitor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
  </svg>
);
const IconLock = ({ color = '#dc2626', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconBulb = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>
);
const IconSupport = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/>
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const IconDot = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
  </svg>
);
const IconMoney = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5B75" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block text-[#1A5B75]">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconCrossCircle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block text-red-500">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

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
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setIsAdmin(user.user_metadata?.rol === 'admin')
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

  // Simulación del progreso de compatibilidad (85% por defecto si no está definido)
  const avance = estudiante.proyecto_porcentaje_avance || 85;

  // Simulación del progreso del proyecto (68% por defecto si no está definido)
  const progresoProyecto = estudiante.proyecto_porcentaje_avance || 68;

  // Título, descripción y habilidades simuladas
  const tituloProyecto = estudiante.proyecto_titulo || 'PROYECTO TFG ANA';
  const descripcionProyecto = estudiante.proyecto_descripcion || 'Desarrollo de un modelo de gestión estratégica para startups de base tecnológica en zonas rurales, enfocado en la sostenibilidad financiera y el impacto social.';
  const areaTematica = estudiante.proyecto_area_tematica || estudiante.proyecto_tipo || 'Tecnología';
  const habilidadesTecnicasMock = tecnicas.length > 0 ? tecnicas : ['Análisis de Datos', 'Gestión de Proyectos', 'Estrategia Digital'];

  // Intereses humanos con fallback de ejemplo
  const deportesMock = (estudiante.deportes && estudiante.deportes.length > 0) ? estudiante.deportes : ['Fútbol', 'Ciclismo'];
  const musicaMock = (estudiante.musica && estudiante.musica.length > 0) ? estudiante.musica : ['Guitarra', 'Pop Latino'];
  const hobbiesMock = (estudiante.hobbies && estudiante.hobbies.length > 0) ? estudiante.hobbies : ['Fotografía', 'Lectura', 'Viajes'];
  const idiomasMock = (estudiante.idiomas && estudiante.idiomas.length > 0) ? estudiante.idiomas : ['Español (Nativo)', 'Inglés (B2)'];

  // Pasión combinada para el match
  const pasionesMatch = [...deportesMock.slice(0,1), ...musicaMock.slice(0,1), ...hobbiesMock.slice(0,1)];

  return (
    <div className="font-sans text-[#003B4F] max-w-xl mx-auto pb-12">

      {/* ── SECCIÓN CENTRALIZADA CON AVATAR ────────────────── */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-4">
          {/* Anillo de Gradiente Fino */}
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#54BCEB] via-[#003B4F] to-[#E84F26] shadow-md">
            <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
              {estudiante.foto_url ? (
                <img src={getAvatarUrl(estudiante.foto_url) as string} alt={estudiante.nombre} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-[#003B4F] font-black text-4xl">{iniciales}</span>
              )}
            </div>
          </div>
          {/* Badge Circular bottom-right */}
          <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#1A5B75] flex items-center justify-center border-2 border-white shadow-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>

        {/* Nombres y Subtítulos */}
        <h1 className="text-3xl font-black text-[#003B4F] tracking-tight">{estudiante.nombre}</h1>
        {estudiante.carrera && <p className="text-sm font-bold text-[#1F8BB6] mt-1">{estudiante.carrera}</p>}
        {estudiante.sede && (
          <p className="text-xs text-slate-500 font-semibold mt-1">
            📍 Sede de {estudiante.sede}
          </p>
        )}
      </div>

      {/* ── CARD DE COMPATIBILIDAD ─────────────────────────── */}
      <div className="bg-[#EAF5FA]/90 backdrop-blur-sm rounded-2xl p-5 border border-[#B3DCEE] shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-[#1A5B75] uppercase tracking-wider">Compatibilidad</span>
          <span className="text-lg font-black text-[#1A5B75]">{avance}%</span>
        </div>
        {/* Barra de Progreso */}
        <div className="w-full bg-[#E0F2FE] rounded-full h-2.5 overflow-hidden shadow-inner mb-4">
          <div 
            className="bg-[#1A5B75] h-2.5 rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${avance}%` }}
          />
        </div>
        {/* Grid de Criterios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-bold text-[#1A5B75] mb-4">
          <div className="flex items-center gap-2">
            <IconCheckCircle /> Carrera afín
          </div>
          <div className="flex items-center gap-2">
            <IconCheckCircle /> Ubicación
          </div>
          <div className="flex items-center gap-2">
            <IconCheckCircle /> Intereses comunes
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <IconCrossCircle /> Disponibilidad horaria
          </div>
        </div>

        {/* ── PASIONES HUMANAS EN EL MATCH ── */}
        <div className="border-t border-[#B3DCEE]/60 pt-4">
          <p className="text-[10px] font-black text-[#1A5B75] uppercase tracking-widest mb-3">Intereses Compartidos</p>
          <div className="flex flex-wrap gap-2">
            {pasionesMatch.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#54BCEB]/30 text-[#003B4F] text-[11px] font-bold shadow-sm">
                {i === 0 ? '⚽' : i === 1 ? '🎵' : '📸'} {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTONES DE ACCIÓN ──────────────────────────────── */}
      <div className="flex gap-4 w-full mb-6">
        <button 
          onClick={() => setShowMentoriaModal(true)}
          className="w-1/2 inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold bg-[#B43B06] hover:bg-[#9E3405] text-white py-3.5 px-4 shadow transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <IconMail /> Contactar
        </button>
        <button className="w-1/2 inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold bg-white border border-[#1A5B75]/20 hover:border-[#1A5B75]/40 text-[#1A5B75] py-3.5 px-4 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer">
          <IconShare /> Compartir Perfil
        </button>
      </div>

      {/* ── CARD PROYECTO TFG ─────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-[#B3DCEE]/60 shadow-sm mb-6">
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proyecto de Graduación</span>
          <span className="text-[10px] font-bold text-[#1A5B75] bg-[#E0F2FE] px-2.5 py-1 rounded-full shadow-sm">
            {areaTematica}
          </span>
        </div>
        <h2 className="text-lg font-black text-[#B43B06] mb-3 uppercase">
          {tituloProyecto}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed font-medium mb-5">
          {descripcionProyecto}
        </p>
        
        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progreso del Proyecto</span>
            <span className="text-xs font-black text-[#1A5B75]">{progresoProyecto}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className="bg-[#1A5B75] h-2 rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${progresoProyecto}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── COLUMNAS OPORTUNIDADES E INTERESES ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <span>👜</span> Oportunidades
          </div>
          <div className="text-xs font-semibold text-slate-400 italic">
            {getTagsApoyo().length > 0 ? getTagsApoyo().join(', ') : 'Sin registrar'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <span>❤️</span> Intereses
          </div>
          <div className="text-xs font-semibold text-slate-400 italic">
            {blandas.length > 0 ? blandas.join(', ') : 'Sin registrar'}
          </div>
        </div>
      </div>

      {/* ── EXPEDIENTE ACADÉMICO (DARK SLATE) ───────────────── */}
      <div className="rounded-2xl bg-[#2D3328] p-6 text-white shadow-md relative overflow-hidden mb-6">
        <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none text-white">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
            <path d="M4 12v6.59l8 4.36 8-4.36V12l-8 4.36-8-4.36z"/>
          </svg>
        </div>
        <h3 className="font-extrabold text-xs tracking-widest text-slate-300 uppercase pb-4 mb-5 border-b border-white/10 flex items-center gap-2">
          <span>🎓</span> Expediente Académico
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4 relative z-10">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Carné</p>
            <p className="text-sm font-extrabold text-white">{estudiante.anio_ingreso ? `B${estudiante.anio_ingreso}${Math.floor(1000 + Math.random() * 9000)}` : 'B55241'}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sede</p>
            <p className="text-sm font-extrabold text-white">{estudiante.sede || 'Occidente'}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nivel Actual</p>
            <p className="text-sm font-extrabold text-white">Bachillerato</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Año de Ingreso</p>
            <p className="text-sm font-extrabold text-white">{estudiante.anio_ingreso || 2022}</p>
          </div>
        </div>
      </div>

      {/* ── VIDA MÁS ALLÁ DEL AULA ────────────────────────── */}
      <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FAF9E6] rounded-2xl p-6 border border-[#E84F26]/10 shadow-sm mb-6 relative overflow-hidden">
        {/* Watermark decorativo */}
        <div className="absolute top-3 right-4 text-5xl opacity-10 pointer-events-none select-none">🌟</div>
        <h3 className="text-lg font-black text-[#003B4F] mb-1 flex items-center gap-2">
          <span>🎨</span> Vida Más Allá del Aula
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-4">Lo que me apasiona fuera de los libros</p>

        {/* Descripción extendida del estudiante sobre intereses humanos */}
        <div className="bg-white/80 rounded-xl p-4 border border-[#E84F26]/10 mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            ✍️ En mis propias palabras
          </p>
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
            {`Me defino como alguien que equilibra la vida académica con la física y la creatividad. Creo que los mejores profesionales son aquellos que también tienen intereses humanos sólidos: yo encuentro mi mejor versión en la cancha, en los libros y cuando exploro nuevos lugares. Eso me da perspectiva y resiliencia para enfrentar retos profesionales.`}
          </p>
        </div>

        <div className="space-y-4">
          {/* Deportes */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">⚽ Deportes & Actividad Física</p>
            <div className="flex flex-wrap gap-2">
              {deportesMock.map((d, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-[#E84F26]/10 text-[#B43B06] text-xs font-bold border border-[#E84F26]/20">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Música */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">🎵 Música & Artes</p>
            <div className="flex flex-wrap gap-2">
              {musicaMock.map((m, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-[#8B5CF6]/10 text-[#6D28D9] text-xs font-bold border border-[#8B5CF6]/20">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Hobbies */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">✨ Pasatiempos & Hobbies</p>
            <div className="flex flex-wrap gap-2">
              {hobbiesMock.map((h, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#065F46] text-xs font-bold border border-[#10B981]/20">
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Idiomas */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">🌐 Idiomas</p>
            <div className="flex flex-wrap gap-2">
              {idiomasMock.map((lang, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-[#1A5B75]/10 text-[#1A5B75] text-xs font-bold border border-[#1A5B75]/20">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MI PRESENTACIÓN ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm mb-6 relative overflow-hidden">
        {/* Barra lateral de acento tricolor */}
        <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl bg-[#54BCEB]" />
        <div className="pl-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#E0F2FE] flex items-center justify-center flex-shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A5B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 className="text-sm font-black text-[#003B4F] uppercase tracking-wider">Mi Presentación</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {estudiante.sobre_mi ||
              `Soy un estudiante apasionado por la tecnología y la innovación, con interés genuino en resolver problemas reales mediante el pensamiento analítico y el trabajo en equipo. A nivel educativo, me esmero en conectar la teoría académica con aplicaciones prácticas que generen impacto. Fuera del aula, me motivan el deporte, la música y aprender de culturas distintas. Busco oportunidades donde pueda aportar mis habilidades y seguir creciendo profesionalmente junto a personas y organizaciones que compartan mis valores.`
            }
          </p>
        </div>
      </div>

      {/* ── HABILIDADES TÉCNICAS ───────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6">
        <h3 className="text-lg font-black text-[#003B4F] mb-4 flex items-center gap-2">
          <span>💻</span> Habilidades Técnicas
        </h3>
        <div className="flex flex-wrap gap-2">
          {habilidadesTecnicasMock.map((h, i) => (
            <span key={i} className="px-3.5 py-2 rounded-xl bg-[#E0F2FE]/70 text-[#003B4F] text-xs font-bold border border-[#54BCEB]/30 shadow-sm">
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* ── PRIVACIDAD ─────────────────────────────────────── */}
      <div className="bg-[#FFFBF7]/90 backdrop-blur-sm rounded-2xl p-5 border border-red-100 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <IconLock color="#dc2626" size={16} />
          <h4 className="font-extrabold text-sm text-[#003B4F]">Privacidad</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-medium mb-5">
          Para proteger la integridad del estudiante, la información sensible como el nivel de beca y detalles socioeconómicos están restringidos.
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-t border-slate-100/60">
            <span className="text-xs text-slate-500 font-semibold">Nivel de Beca</span>
            <span className="text-xs font-bold text-[#003B4F] flex items-center gap-1.5">
              Categoría 5 <IconLock color="#b0c4d8" size={12} />
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-slate-100/60">
            <span className="text-xs text-slate-500 font-semibold">Promedio Ponderado</span>
            <span className="text-xs font-bold text-[#003B4F] flex items-center gap-1.5">
              9.25 <IconLock color="#b0c4d8" size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* ── TRAYECTORIA ESTUDIANTIL ────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border-l-4 border-l-[#1F8BB6] border border-slate-200/80 shadow-sm mb-6">
        <h3 className="text-lg font-black text-[#003B4F] mb-4 flex items-center gap-2">
          <span>🚌</span> Trayectoria Estudiantil
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#E0F2FE] text-[#1F8BB6] mt-0.5 flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#003B4F]">Tutorías previas</h4>
              <p className="text-xs text-slate-500 font-medium">Matemática General (2023)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#E0F2FE] text-[#1F8BB6] mt-0.5 flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#003B4F]">Participación en asociaciones</h4>
              <p className="text-xs text-slate-500 font-medium">Vocalía de Bienestar Estudiantil</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACCIONES PARA MENTORES (DASHED GREEN) ───────────── */}
      <div className="rounded-2xl border-2 border-dashed border-[#8E9F7F]/40 bg-[#F4F9EE] p-5 mb-6">
        <p className="text-[10px] font-black text-[#5C6E4F] text-center uppercase tracking-widest mb-4">Acciones para Mentores</p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setShowMentoriaModal(true)}
            className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold bg-white text-[#1A5B75] hover:bg-slate-50 h-12 px-4 shadow transition-all duration-200 active:scale-95 cursor-pointer border border-[#1A5B75]/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
            </svg>
            Ofrecer Mentoría
          </button>
          <button 
            onClick={() => setShowApoyarModal(true)}
            className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold bg-white text-[#B43B06] hover:bg-slate-50 h-12 px-4 shadow transition-all duration-200 active:scale-95 cursor-pointer border border-[#B43B06]/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M15 9l-9 9m9-9A6.5 6.5 0 1 0 5.8 4.2L15 9zm0 0l6-6"/>
            </svg>
            Apoyar Proyecto
          </button>
        </div>
      </div>

      {/* ── ESTUDIANTES RELACIONADOS ── */}
      {estudiantesRelacionados.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200/60">
          <h2 className="text-2xl font-black text-[#003B4F] mb-1">Otros estudiantes que podrían interesarte</h2>
          {estudiante.carrera && (
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Estudiantes de <strong className="text-[#003B4F] font-bold">{estudiante.carrera}</strong>.
            </p>
          )}
          <GrillaEstudiantes estudiantes={estudiantesRelacionados} />
        </div>
      )}

      {/* ── MODAL MENTORÍA ── */}
      {showMentoriaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md border border-slate-200/80 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowMentoriaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-2xl font-bold cursor-pointer"
            >
              &times;
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-black text-[#003B4F] mb-1">Ofrecer Mentoría</h2>
              <p className="text-xs text-slate-500 font-medium">
                Has seleccionado ofrecer mentoría a <strong className="text-[#003B4F] font-bold">{estudiante.nombre}</strong>.
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-6 space-y-3.5">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Carrera</p>
                <p className="text-xs font-bold text-[#003B4F]">{nd(estudiante.carrera)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Especialización Principal</p>
                <p className="text-xs font-bold text-[#003B4F]">{especializacion}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Áreas de Interés</p>
                <div className="flex flex-wrap gap-1.5">
                  {estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0 ? (
                    estudiante.areas_de_interes.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[#003B4F] text-[10px] font-bold shadow-sm">
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
              <p className="text-[10px] font-black text-[#003B4F] uppercase tracking-wider mb-3">Información de Contacto</p>
              {estudiante.url_linkedin || estudiante.url_portfolio ? (
                <div className="flex gap-3">
                  {estudiante.url_linkedin && (
                    <a href={estudiante.url_linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a66c2] text-white text-xs font-bold flex-1 shadow-sm active:scale-95">
                      LinkedIn
                    </a>
                  )}
                  {estudiante.url_portfolio && (
                    <a href={estudiante.url_portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#003B4F] text-white text-xs font-bold flex-1 shadow-sm active:scale-95">
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
                className="px-4 py-2 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL APÓYAR PROYECTO ── */}
      {showApoyarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9998] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md border border-slate-200/80 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowApoyarModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-2xl font-bold cursor-pointer"
            >
              &times;
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-black text-[#003B4F] mb-1">Apoyar Proyecto</h2>
              <p className="text-xs text-slate-500 font-medium">
                Estás a punto de apoyar a <strong className="text-[#003B4F] font-bold">{estudiante.nombre}</strong> en su proyecto.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-6 space-y-3.5">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Carrera</p>
                <p className="text-xs font-bold text-[#003B4F]">{nd(estudiante.carrera)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Especialización Principal</p>
                <p className="text-xs font-bold text-[#003B4F]">{especializacion}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Áreas de Interés</p>
                <div className="flex flex-wrap gap-1.5">
                  {estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0 ? (
                    estudiante.areas_de_interes.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[#003B4F] text-[10px] font-bold shadow-sm">
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
              {estudiante.url_linkedin || estudiante.url_portfolio ? (
                <div className="flex gap-3">
                  {estudiante.url_linkedin && (
                    <a href={estudiante.url_linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a66c2] text-white text-xs font-bold flex-1 shadow-sm active:scale-95">
                      LinkedIn
                    </a>
                  )}
                  {estudiante.url_portfolio && (
                    <a href={estudiante.url_portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E84F26] text-white text-xs font-bold flex-1 shadow-sm active:scale-95">
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

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowApoyarModal(false)} 
                className="px-4 py-2 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
